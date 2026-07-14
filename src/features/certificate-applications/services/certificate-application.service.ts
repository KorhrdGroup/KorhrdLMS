import { CERTIFICATE_DELIVERY_STATUS_LABELS } from "@/features/certificates/constants";
import {
  CERTIFICATE_ISSUANCE_COST,
  CERTIFICATE_PAYMENT_METHOD_OPTIONS,
} from "@/features/certificate-applications/constants";
import {
  findActiveCertificateApplication,
  insertCertificateApplication,
  listCertificateApplicationsByMember,
} from "@/features/certificate-applications/repositories/certificate-application.repository";
import type {
  ApplicantProfile,
  CertificateApplicationPageData,
  EligibleCertificateCourse,
  MyCertificateApplicationItem,
  SubmitCertificateApplicationInput,
  SubmitCertificateApplicationResult,
} from "@/features/certificate-applications/types/certificate-application.types";
import { computeCompletionEligibility } from "@/features/completion-certificates/lib/completion-eligibility";
import { PAYMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import { formatFullAddress } from "@/features/certificates/lib/certificate.utils";
import {
  findAvailableCertificatePrepayment,
  markCertificatePrepaymentUsed,
} from "@/features/certificate-prepayments/services/certificate-prepayment-matching.service";
import { createClient } from "@/lib/supabase/server";
import type { Database, EnrollmentStatus, PaymentStatus } from "@/types/database.types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type MemberProfileRow = {
  name: string;
  birth_date: string | null;
  phone: string | null;
  postal_code: string | null;
  address: string | null;
  address_detail: string | null;
};

async function getMemberProfile(
  supabase: SupabaseServerClient,
  memberId: string,
): Promise<{ loginId: string; profile: ApplicantProfile } | null> {
  const { data, error } = await supabase
    .from("members")
    .select("login_id, name, birth_date, phone, postal_code, address, address_detail")
    .eq("id", memberId)
    .is("deleted_at", null)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as MemberProfileRow & { login_id: string };

  return {
    loginId: row.login_id,
    profile: {
      name: row.name,
      birthDate: row.birth_date,
      phone: row.phone,
      postalCode: row.postal_code,
      address: row.address,
      addressDetail: row.address_detail,
    },
  };
}

type ConfirmedEnrollmentRow = {
  id: string;
  status: EnrollmentStatus;
  end_date: string;
  course: { id: string; name: string };
};

const CONFIRMED_ENROLLMENT_SELECT = `
  id,
  status,
  end_date,
  course:courses!inner (
    id,
    name
  )
` as const;

async function getConfirmedEnrollmentsWithCourse(
  supabase: SupabaseServerClient,
  memberId: string,
): Promise<ConfirmedEnrollmentRow[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select(CONFIRMED_ENROLLMENT_SELECT)
    .eq("member_id", memberId)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .order("end_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ConfirmedEnrollmentRow[];
}

/**
 * 로그인한 학생의 자격증발급신청 화면(`/certificate/apply`)에 필요한 데이터를 조회합니다.
 *
 * 수료 완료(진도율 60%+시험 60점 이상 합격 기준을 모두 충족)한 과정만 신청 가능한
 * 과정으로 노출하며, 이미 신청(취소 제외)한 과정은 `alreadyApplied`로 표시합니다.
 * 민간자격증 LMS 운영 방식에 따라 수강기간(end_date) 종료 여부는 신청 가능 조건에
 * 포함하지 않습니다(수강기간이 남아있어도 합격 기준만 충족하면 즉시 신청 가능).
 */
export async function getCertificateApplicationPageData(
  memberId: string,
): Promise<CertificateApplicationPageData | null> {
  if (!memberId.trim()) {
    return null;
  }

  const supabase = await createClient();
  const memberResult = await getMemberProfile(supabase, memberId);

  if (!memberResult) {
    return null;
  }

  const enrollments = await getConfirmedEnrollmentsWithCourse(supabase, memberId);

  const eligibleCourses: EligibleCertificateCourse[] = [];

  for (const enrollment of enrollments) {
    const eligibility = await computeCompletionEligibility(
      enrollment.id,
      enrollment.course.id,
      enrollment.status,
      enrollment.end_date,
    );

    if (!eligibility.isCompleted) {
      continue;
    }

    const activeApplication = await findActiveCertificateApplication(memberId, enrollment.course.id);
    const availablePrepayment = await findAvailableCertificatePrepayment(
      supabase,
      memberId,
      enrollment.course.id,
    );

    eligibleCourses.push({
      enrollmentId: enrollment.id,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.name,
      alreadyApplied: Boolean(activeApplication),
      applicationId: activeApplication?.id ?? null,
      prepaymentAmount: Math.min(
        availablePrepayment?.amount ?? 0,
        CERTIFICATE_ISSUANCE_COST,
      ),
    });
  }

  return {
    profile: memberResult.profile,
    eligibleCourses,
    issuanceCost: CERTIFICATE_ISSUANCE_COST,
  };
}

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type PaymentRequest = {
  orderId: string;
  amount: number;
  method: SubmitCertificateApplicationInput["paymentMethod"];
  buyerName: string;
  productName: string;
};

/**
 * 결제 요청 데이터(주문번호/금액/결제수단/구매자 정보)만 생성합니다.
 * TODO(PG 연동): 실제 PG(예: 토스페이먼츠/이니시스 등) 연동 시, 이 함수가 반환한 값으로
 * 결제창을 호출하고 콜백에서 `certificate_applications.payment_status`를 갱신하도록
 * 교체해주세요. 현재는 신청 접수만 처리하고 결제 확인은 무통장입금 등 수동 확인으로
 * 진행합니다.
 */
function preparePaymentRequest(
  applicationId: string,
  input: SubmitCertificateApplicationInput,
  buyerName: string,
  amount: number,
): PaymentRequest {
  return {
    orderId: applicationId,
    amount,
    method: input.paymentMethod,
    buyerName,
    productName: "자격증 발급신청",
  };
}

/**
 * 자격증발급신청을 저장합니다. 제출 직전에 수료 조건/중복신청 여부를 서버에서
 * 다시 검증해, 클라이언트에서 조작된 courseId로 신청하는 것을 방지합니다.
 */
export async function submitCertificateApplication(
  memberId: string,
  input: SubmitCertificateApplicationInput,
): Promise<SubmitCertificateApplicationResult> {
  if (!memberId.trim()) {
    return { success: false, code: "not_logged_in", message: "로그인이 필요합니다." };
  }

  if (!normalize(input.deliveryName)) {
    return {
      success: false,
      code: "validation_error",
      message: "받으시는 분 이름을 입력해주세요.",
      field: "deliveryName",
    };
  }

  if (!normalize(input.phone)) {
    return {
      success: false,
      code: "validation_error",
      message: "연락처를 입력해주세요.",
      field: "phone",
    };
  }

  if (!normalize(input.address)) {
    return {
      success: false,
      code: "validation_error",
      message: "주소를 입력해주세요.",
      field: "address",
    };
  }

  const isKnownPaymentMethod = CERTIFICATE_PAYMENT_METHOD_OPTIONS.some(
    (option) => option.value === input.paymentMethod,
  );

  if (!isKnownPaymentMethod) {
    return {
      success: false,
      code: "validation_error",
      message: "결제방법을 선택해주세요.",
      field: "paymentMethod",
    };
  }

  const pageData = await getCertificateApplicationPageData(memberId);

  if (!pageData) {
    return { success: false, code: "not_logged_in", message: "회원 정보를 확인할 수 없습니다." };
  }

  const target = pageData.eligibleCourses.find((course) => course.courseId === input.courseId);

  if (!target) {
    return {
      success: false,
      code: "not_eligible",
      message: "수료 조건을 충족한 과정만 자격증을 신청할 수 있습니다.",
      field: "courseId",
    };
  }

  if (target.alreadyApplied) {
    return {
      success: false,
      code: "already_applied",
      message: "이미 신청한 자격증입니다. 신청내역 조회 화면에서 확인해주세요.",
      field: "courseId",
    };
  }

  const supabase = await createClient();
  const memberResult = await getMemberProfile(supabase, memberId);

  if (!memberResult) {
    return { success: false, code: "not_logged_in", message: "회원 정보를 확인할 수 없습니다." };
  }

  const today = new Date().toISOString().slice(0, 10);

  // 선납결제 자동 연결: 학생이 미리 결제(관리자가 확인 후 등록한 선납결제)한 내역이
  // 있으면 최종결제금액에서 선납금만큼 차감하고, 신청 접수 후 해당 선납결제를
  // 사용 처리(used_at/certificate_application_id)합니다. 전액 충당되면 결제상태를
  // "prepaid"(선납완료)로, 일부만 충당되면 남은 금액은 여전히 받아야 하므로
  // "partial"(부분결제)로 표시해 관리자가 잔액 수납 여부를 구분할 수 있게 합니다.
  const availablePrepayment = await findAvailableCertificatePrepayment(
    supabase,
    memberId,
    target.courseId,
  );
  const prepaymentDiscount = Math.min(
    availablePrepayment?.amount ?? 0,
    CERTIFICATE_ISSUANCE_COST,
  );
  const finalPaymentAmount = CERTIFICATE_ISSUANCE_COST - prepaymentDiscount;

  let initialPaymentStatus: PaymentStatus = "unpaid";
  if (availablePrepayment) {
    initialPaymentStatus = finalPaymentAmount <= 0 ? "prepaid" : "partial";
  }

  const insertData: Database["public"]["Tables"]["certificate_applications"]["Insert"] = {
    member_id: memberId,
    course_id: target.courseId,
    certificate_kind: "course_completion",
    certificate_name: `${target.courseTitle} 자격증`,
    member_login_id: memberResult.loginId,
    applicant_name: memberResult.profile.name,
    birth_date: memberResult.profile.birthDate,
    phone: emptyToNull(input.phone),
    postal_code: emptyToNull(input.postalCode),
    address: emptyToNull(input.address),
    address_detail: emptyToNull(input.addressDetail),
    photo_url: emptyToNull(input.photoUrl),
    issuance_cost: CERTIFICATE_ISSUANCE_COST,
    actual_payment_amount: finalPaymentAmount,
    payment_method: input.paymentMethod,
    payment_status: initialPaymentStatus,
    delivery_status: "pending",
    memo: emptyToNull(input.memo),
    applied_at: today,
  };

  try {
    const applicationId = await insertCertificateApplication(insertData);

    if (availablePrepayment) {
      // 신청 접수 후 곧바로 사용 처리합니다. 동시 요청으로 이미 다른 신청에 먼저
      // 사용된 경우(used_at IS NULL 조건 불일치)에도 이 신청 건 자체는 이미 정상
      // 접수되었으므로 실패로 처리하지 않고 그대로 진행합니다.
      await markCertificatePrepaymentUsed(supabase, availablePrepayment.id, applicationId);
    }

    // TODO(PG 연동): paymentRequest를 실제 PG 결제창 호출부로 전달하세요.
    // 현재는 결제 준비 데이터 생성까지만 수행하고, 실제 결제 확인은 무통장입금 등
    // 수동 확인(관리자 자격증신청관리)으로 진행합니다.
    preparePaymentRequest(applicationId, input, memberResult.profile.name, finalPaymentAmount);

    return {
      success: true,
      applicationId,
      message:
        availablePrepayment && finalPaymentAmount <= 0
          ? "자격증 발급신청이 접수되었습니다. 선납결제로 결제가 완료되었습니다."
          : "자격증 발급신청이 접수되었습니다. 결제 연동은 준비 중입니다.",
    };
  } catch (error) {
    const pgError = error as { code?: string };
    if (pgError?.code === "23505") {
      return {
        success: false,
        code: "already_applied",
        message: "이미 신청한 자격증입니다. 신청내역 조회 화면에서 확인해주세요.",
        field: "courseId",
      };
    }

    throw error;
  }
}

/** 로그인한 학생 본인의 자격증발급신청 내역만 조회합니다. */
export async function getMyCertificateApplications(
  memberId: string,
): Promise<MyCertificateApplicationItem[]> {
  if (!memberId.trim()) {
    return [];
  }

  const rows = await listCertificateApplicationsByMember(memberId);

  return rows.map((row) => ({
    id: row.id,
    appliedAt: row.applied_at,
    certificateName: row.certificate_name,
    paymentStatus: row.payment_status,
    paymentStatusLabel: PAYMENT_STATUS_LABELS[row.payment_status] ?? row.payment_status,
    deliveryStatus: row.delivery_status,
    deliveryStatusLabel: CERTIFICATE_DELIVERY_STATUS_LABELS[row.delivery_status] ?? row.delivery_status,
    fullAddress: formatFullAddress(row.postal_code, row.address, row.address_detail),
    issuedAt: row.issued_at,
  }));
}
