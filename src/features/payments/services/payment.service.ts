import {
  formatDate,
  isApplicationOpen,
} from "@/features/enrollment-catalog/services/enrollment-catalog.service";
import {
  findActivePayment,
  findPaymentById,
  insertPayment,
  updatePayment,
  type CoursePaymentRecord,
} from "@/features/payments/repositories/course-payment.repository";
import type {
  CancelPaymentInput,
  CancelPaymentResult,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  CoursePaymentSummary,
  CreatePaymentInput,
  CreatePaymentResult,
  FailPaymentInput,
  FailPaymentResult,
  RefundPaymentInput,
  RefundPaymentResult,
} from "@/features/payments/types/payment.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * PG(결제대행사) 연동 구조의 핵심 서비스입니다.
 *
 * 실제 PG 결제창 호출(리다이렉트/위젯)은 아직 붙이지 않았지만, 이 서비스의
 * 함수 경계(createPayment → confirmPayment/failPayment/cancelPayment)는
 * 실제 PG 연동 시에도 그대로 재사용할 수 있도록 설계했습니다.
 *
 *   학생 과정 선택 → createPayment() [course_payments: ready]
 *     → (실제 PG 연동 시) PG 결제창 호출 → PG 콜백/웹훅
 *     → confirmPayment() [course_payments: paid, enrollments: confirmed 자동 생성]
 *       또는 failPayment() [course_payments: failed]
 *
 * 개발 중에는 confirmPayment()를 "결제 성공 처리(테스트)" 버튼에서 직접 호출합니다.
 */

const DEV_PG_PROVIDER = "dev_test";

function toSummary(
  record: CoursePaymentRecord,
  course: { name: string; code: string },
): CoursePaymentSummary {
  return {
    id: record.id,
    courseId: record.courseId,
    courseName: course.name,
    courseSlug: course.code,
    classId: record.classId,
    amount: record.amount,
    paymentMethod: record.paymentMethod,
    status: record.status,
    pgProvider: record.pgProvider,
    pgOrderId: record.pgOrderId,
    failedReason: record.failedReason,
    createdAt: record.createdAt,
  };
}

function generatePgOrderId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${stamp}-${random}`;
}

export async function createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("id", input.memberId)
    .is("deleted_at", null)
    .eq("status", "active")
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    return {
      success: false,
      code: "member_not_found",
      message: "회원 정보를 확인할 수 없습니다. 다시 로그인 후 시도해주세요.",
    };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, code, name, status, price")
    .eq("id", input.courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!course || course.status !== "active") {
    return {
      success: false,
      code: "course_not_found",
      message: "결제할 수 없는 과정입니다.",
    };
  }

  const { data: klass, error: classError } = await supabase
    .from("classes")
    .select("id, course_id, application_start, application_end")
    .eq("id", input.classId)
    .is("deleted_at", null)
    .maybeSingle();

  if (classError) {
    throw new Error(classError.message);
  }

  if (!klass || klass.course_id !== input.courseId) {
    return {
      success: false,
      code: "class_not_found",
      message: "선택한 수강반 정보를 확인할 수 없습니다.",
    };
  }

  const today = formatDate(new Date());

  if (!isApplicationOpen(klass, today)) {
    return {
      success: false,
      code: "class_closed",
      message: "접수 기간이 종료된 수강반입니다.",
    };
  }

  const { data: confirmedEnrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("member_id", input.memberId)
    .eq("course_id", input.courseId)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .maybeSingle();

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  if (confirmedEnrollment) {
    return {
      success: false,
      code: "already_enrolled",
      message: "이미 수강 확정된 과정입니다.",
    };
  }

  const existingActive = await findActivePayment(input.memberId, input.courseId);

  if (existingActive) {
    return {
      success: true,
      payment: toSummary(existingActive, course),
      reused: true,
    };
  }

  const insertData: Database["public"]["Tables"]["course_payments"]["Insert"] = {
    member_id: input.memberId,
    course_id: input.courseId,
    class_id: input.classId,
    payment_date: today,
    amount: course.price,
    payment_method: "card",
    status: "ready",
    pg_order_id: generatePgOrderId(),
  };

  try {
    const record = await insertPayment(insertData);

    return {
      success: true,
      payment: toSummary(record, course),
      reused: false,
    };
  } catch (error) {
    // 동시 요청 등으로 유니크 인덱스(course_payments_active_member_course_unique)에
    // 걸린 경우, 방금 생성된(또는 이미 있던) 활성 결제 건을 다시 조회해 재사용합니다.
    const reused = await findActivePayment(input.memberId, input.courseId);
    if (reused) {
      return { success: true, payment: toSummary(reused, course), reused: true };
    }

    throw error;
  }
}

async function getCourseForSummary(courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("name, code")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? { name: "", code: "" };
}

/**
 * 결제 완료 처리 → `course_payments.status = 'paid'` 로 변경하고
 * `enrollments`를 자동 생성(또는 기존 신청 건을 확정)합니다.
 * 실제 PG 콜백/웹훅에서 호출하거나, 개발 중에는 "결제 성공 처리(테스트)" 버튼에서 호출합니다.
 */
export async function confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
  const record = await findPaymentById(input.paymentId);

  if (!record) {
    return { success: false, code: "payment_not_found", message: "결제 정보를 찾을 수 없습니다." };
  }

  if (record.memberId !== input.memberId) {
    return { success: false, code: "forbidden", message: "본인의 결제만 처리할 수 있습니다." };
  }

  const course = await getCourseForSummary(record.courseId);

  if (record.status === "paid") {
    const enrollmentId = record.enrollmentId ?? (await findConfirmedEnrollmentId(record.memberId, record.courseId));
    return {
      success: true,
      payment: toSummary(record, course),
      enrollmentId: enrollmentId ?? "",
      alreadyPaid: true,
    };
  }

  if (record.status !== "ready" && record.status !== "pending") {
    return {
      success: false,
      code: "already_terminated",
      message: "이미 종료된 결제입니다. 처음부터 다시 결제를 진행해주세요.",
    };
  }

  if (!record.classId) {
    return { success: false, code: "class_not_found", message: "수강반 정보를 확인할 수 없습니다." };
  }

  const supabase = await createClient();
  const { data: klass, error: classError } = await supabase
    .from("classes")
    .select("id, name, year, enrollment_start, enrollment_end")
    .eq("id", record.classId)
    .maybeSingle();

  if (classError) {
    throw new Error(classError.message);
  }

  if (!klass) {
    return { success: false, code: "class_not_found", message: "수강반 정보를 확인할 수 없습니다." };
  }

  const now = new Date().toISOString();
  const today = formatDate(new Date());

  const enrollmentId = await upsertConfirmedEnrollment(supabase, {
    memberId: record.memberId,
    courseId: record.courseId,
    batch: klass.name,
    year: klass.year,
    startDate: klass.enrollment_start,
    endDate: klass.enrollment_end,
    applicationDate: today,
    confirmedAt: now,
  });

  const updated = await updatePayment(record.id, {
    status: "paid",
    payment_date: today,
    approved_at: now,
    enrollment_id: enrollmentId,
    pg_provider: input.pgProvider ?? DEV_PG_PROVIDER,
    pg_transaction_id: input.pgTransactionId ?? null,
  });

  return {
    success: true,
    payment: toSummary(updated, course),
    enrollmentId,
    alreadyPaid: false,
  };
}

async function findConfirmedEnrollmentId(memberId: string, courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("member_id", memberId)
    .eq("course_id", courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function upsertConfirmedEnrollment(
  supabase: SupabaseServerClient,
  input: {
    memberId: string;
    courseId: string;
    batch: string;
    year: number;
    startDate: string;
    endDate: string;
    applicationDate: string;
    confirmedAt: string;
  },
): Promise<string> {
  const { data: existing, error: existingError } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("member_id", input.memberId)
    .eq("course_id", input.courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const { data, error } = await supabase
      .from("enrollments")
      .update({
        status: "confirmed",
        payment_status: "paid",
        confirmed_at: existing.status === "confirmed" ? undefined : input.confirmedAt,
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.id;
  }

  const insertData: Database["public"]["Tables"]["enrollments"]["Insert"] = {
    member_id: input.memberId,
    course_id: input.courseId,
    batch: input.batch,
    year: input.year,
    start_date: input.startDate,
    end_date: input.endDate,
    status: "confirmed",
    payment_status: "paid",
    application_date: input.applicationDate,
    confirmed_at: input.confirmedAt,
  };

  const { data, error } = await supabase
    .from("enrollments")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

/** 학생 결제(체크아웃) 화면에서 결제 1건을 조회합니다. 본인 소유가 아니면 null을 반환합니다. */
export async function getPaymentForCheckout(
  paymentId: string,
  memberId: string,
): Promise<CoursePaymentSummary | null> {
  const record = await findPaymentById(paymentId);

  if (!record || record.memberId !== memberId) {
    return null;
  }

  const course = await getCourseForSummary(record.courseId);
  return toSummary(record, course);
}

export async function failPayment(input: FailPaymentInput): Promise<FailPaymentResult> {
  const record = await findPaymentById(input.paymentId);

  if (!record) {
    return { success: false, message: "결제 정보를 찾을 수 없습니다." };
  }

  if (input.memberId && record.memberId !== input.memberId) {
    return { success: false, message: "본인의 결제만 처리할 수 있습니다." };
  }

  if (record.status === "paid") {
    return { success: false, message: "이미 결제가 완료된 건은 실패 처리할 수 없습니다. 환불을 이용해주세요." };
  }

  const course = await getCourseForSummary(record.courseId);
  const updated = await updatePayment(record.id, {
    status: "failed",
    failed_reason: input.reason ?? "PG 결제 실패",
  });

  return { success: true, payment: toSummary(updated, course) };
}

export async function cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentResult> {
  const record = await findPaymentById(input.paymentId);

  if (!record) {
    return { success: false, message: "결제 정보를 찾을 수 없습니다." };
  }

  if (input.memberId && record.memberId !== input.memberId) {
    return { success: false, message: "본인의 결제만 처리할 수 있습니다." };
  }

  if (record.status === "paid") {
    return { success: false, message: "이미 결제가 완료된 건은 취소할 수 없습니다. 환불을 이용해주세요." };
  }

  if (record.status === "canceled" || record.status === "refunded") {
    const course = await getCourseForSummary(record.courseId);
    return { success: true, payment: toSummary(record, course) };
  }

  const course = await getCourseForSummary(record.courseId);
  const updated = await updatePayment(record.id, {
    status: "canceled",
    canceled_at: new Date().toISOString(),
    memo: input.reason ?? null,
  });

  return { success: true, payment: toSummary(updated, course) };
}

/**
 * 환불 처리(관리자용). PaymentService의 4대 함수(create/confirm/fail/cancel) 외에
 * '환불' 상태를 실제로 반영하기 위해 추가한 보조 함수입니다.
 */
export async function refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
  const record = await findPaymentById(input.paymentId);

  if (!record) {
    return { success: false, message: "결제 정보를 찾을 수 없습니다." };
  }

  if (record.status !== "paid") {
    return { success: false, message: "결제 완료 상태인 건만 환불할 수 있습니다." };
  }

  const supabase = await createClient();
  const course = await getCourseForSummary(record.courseId);

  const updated = await updatePayment(record.id, {
    status: "refunded",
    canceled_at: new Date().toISOString(),
    memo: input.reason ?? null,
  });

  if (record.enrollmentId) {
    const { error } = await supabase
      .from("enrollments")
      .update({ payment_status: "refunded" })
      .eq("id", record.enrollmentId);

    if (error) {
      throw new Error(error.message);
    }
  }

  return { success: true, payment: toSummary(updated, course) };
}
