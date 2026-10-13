import { CERTIFICATE_ISSUANCE_COST, CERTIFICATE_PAYMENT_METHOD_OPTIONS } from "@/features/certificate-applications/constants";
import { getCurrentAdminLoginId, isBabyAdmin } from "@/lib/admin/current-admin";
import { todayInKst } from "@/lib/shared/kst-date";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/types/database.types";

/**
 * 어드민 발급신청 "추가" — 관리자가 발급신청 건을 직접 넣습니다 (2026-10-13).
 * 전화·현장 접수처럼 학생이 화면에서 신청하지 않은 건용이라 회원이 아니어도 됩니다
 * (옛 시스템 이관 건처럼 member_id 없이 저장). 아이디를 적었고 그 아이디의 회원이
 * 있으면 회원에 연결합니다. 아기관리자(baby_admin)는 버튼도 안 보이고 여기서도 막습니다.
 */

export type CreateCertificateApplicationInput = {
  certificateName: string;
  applicantName: string;
  loginId: string;
  birthDate: string;
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  amount: string;
  paymentMethod: string;
  paymentStatus: Extract<PaymentStatus, "paid" | "unpaid">;
  memo: string;
};

export type CreateCertificateApplicationResult =
  | { success: true; message: string }
  | { success: false; message: string };

const emptyToNull = (value: string) => (value.trim() ? value.trim() : null);

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function createCertificateApplicationByAdmin(
  input: CreateCertificateApplicationInput,
): Promise<CreateCertificateApplicationResult> {
  // 서버 액션은 /admin 밖에서도 부를 수 있어 관리자 로그인을 직접 확인합니다
  if (!(await getCurrentAdminLoginId()) || (await isBabyAdmin())) {
    return { success: false, message: "발급신청 추가 권한이 없습니다." };
  }

  const certificateName = input.certificateName.trim();
  const applicantName = input.applicantName.trim();
  const birthDate = input.birthDate.trim();
  const amountText = input.amount.replace(/[^\d]/g, "");
  const paymentMethod = input.paymentMethod.trim();

  if (!certificateName) return { success: false, message: "자격증을 입력해주세요." };
  if (!applicantName) return { success: false, message: "이름을 입력해주세요." };
  if (birthDate && !isValidIsoDate(birthDate)) {
    return { success: false, message: "생년월일을 올바르게 입력해주세요." };
  }
  if (!amountText) return { success: false, message: "실결제금액을 입력해주세요." };
  if (input.paymentStatus !== "paid" && input.paymentStatus !== "unpaid") {
    return { success: false, message: "결제상태를 선택해주세요." };
  }
  if (paymentMethod && !CERTIFICATE_PAYMENT_METHOD_OPTIONS.some((option) => option.value === paymentMethod)) {
    return { success: false, message: "결제방법을 다시 선택해주세요." };
  }

  const supabase = await createClient();

  // 아이디를 적었으면 같은 아이디의 회원에 연결합니다 — 비워 두면 비회원 건입니다
  const loginId = input.loginId.trim();
  let memberId: string | null = null;
  if (loginId) {
    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("login_id", loginId)
      .is("deleted_at", null)
      .maybeSingle();
    memberId = member?.id ?? null;
    // 오타로 조용히 비회원 건이 되지 않게 — 회원이 아니면 아이디 칸을 비우고 넣게 합니다
    if (!memberId) {
      return {
        success: false,
        message: `아이디 "${loginId}" 회원이 없습니다. 비회원이면 아이디 칸을 비워주세요.`,
      };
    }
  }

  const paid = input.paymentStatus === "paid";

  const { error } = await supabase.from("certificate_applications").insert({
    // member_id 는 이관 때 NULL 허용으로 바뀌었는데 생성 타입은 아직 필수로 남아 있습니다
    member_id: memberId as string,
    course_id: null,
    certificate_kind: "course_completion",
    certificate_name: certificateName,
    // 비회원은 옛 이관 건처럼 생년월일 6자리(750222)를 아이디 칸에 둡니다 — 목록에 "이름 (750222)" 로 보임.
    // 생년월일도 없으면 빈 값을 막는 CHECK 때문에 "-"
    member_login_id: loginId || (birthDate ? birthDate.slice(2).replaceAll("-", "") : "-"),
    applicant_name: applicantName,
    birth_date: birthDate || null,
    phone: emptyToNull(input.phone),
    postal_code: emptyToNull(input.postalCode),
    address: emptyToNull(input.address),
    address_detail: emptyToNull(input.addressDetail),
    photo_url: null,
    issue_without_photo: true,
    issuance_cost: CERTIFICATE_ISSUANCE_COST,
    actual_payment_amount: Number(amountText),
    payment_method: (paymentMethod || null) as (typeof CERTIFICATE_PAYMENT_METHOD_OPTIONS)[number]["value"] | null,
    payment_status: input.paymentStatus,
    // 결제완료로 넣으면 결제자 칸 맨 위(1번)에 오도록 결제 시각을 지금으로 남깁니다
    paid_at: paid ? new Date().toISOString() : null,
    delivery_status: "pending",
    memo: emptyToNull(input.memo) ?? "관리자 직접 추가",
    applied_at: todayInKst(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: `${applicantName} — 발급신청을 추가했습니다 (${paid ? "결제자" : "미결제자"} 칸).`,
  };
}
