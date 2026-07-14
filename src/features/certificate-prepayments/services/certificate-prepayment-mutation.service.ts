import type {
  CertificatePrepaymentDeleteResult,
  CertificatePrepaymentFormInput,
  CertificatePrepaymentMutationResult,
} from "@/features/certificate-prepayments/types/certificate-prepayment.types";
import { createClient } from "@/lib/supabase/server";
import type { Database, PaymentMethod, PaymentStatus } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const VALID_PAYMENT_METHODS: PaymentMethod[] = [
  "card",
  "bank_transfer",
  "virtual_account",
  "mobile",
  "cash",
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "paid",
  "partial",
  "refunded",
  "canceled",
  "prepaid",
];

async function resolveMemberIdByLoginId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  loginId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("login_id", loginId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

function validateCertificatePrepaymentFormInput(
  input: CertificatePrepaymentFormInput,
): CertificatePrepaymentMutationResult {
  if (!normalize(input.memberLoginId)) {
    return {
      success: false,
      message: "학생 아이디(로그인ID)를 입력해주세요.",
      field: "memberLoginId",
    };
  }

  if (!normalize(input.certificateName)) {
    return {
      success: false,
      message: "선납 과정/자격증명을 입력해주세요.",
      field: "certificateName",
    };
  }

  if (!Number.isFinite(input.amount) || input.amount < 0) {
    return {
      success: false,
      message: "선납금액은 0 이상의 숫자여야 합니다.",
      field: "amount",
    };
  }

  if (input.paymentMethod && !VALID_PAYMENT_METHODS.includes(input.paymentMethod)) {
    return {
      success: false,
      message: "유효하지 않은 결제방법입니다.",
      field: "paymentMethod",
    };
  }

  if (!VALID_PAYMENT_STATUSES.includes(input.paymentStatus)) {
    return {
      success: false,
      message: "유효하지 않은 결제상태입니다.",
      field: "paymentStatus",
    };
  }

  return { success: true, message: "" };
}

export async function createCertificatePrepayment(
  input: CertificatePrepaymentFormInput,
): Promise<CertificatePrepaymentMutationResult> {
  const validation = validateCertificatePrepaymentFormInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();
  const memberId = await resolveMemberIdByLoginId(supabase, normalize(input.memberLoginId));

  if (!memberId) {
    return {
      success: false,
      message: "일치하는 학생 아이디를 찾을 수 없습니다.",
      field: "memberLoginId",
    };
  }

  const insertData: Database["public"]["Tables"]["certificate_prepayments"]["Insert"] = {
    member_id: memberId,
    course_id: emptyToNull(input.courseId),
    certificate_name: normalize(input.certificateName),
    amount: input.amount,
    payment_method: input.paymentMethod || null,
    payment_status: input.paymentStatus,
    paid_at: emptyToNull(input.paidAt),
    memo: emptyToNull(input.memo),
  };

  const { error } = await supabase.from("certificate_prepayments").insert(insertData);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "선납결제 내역이 등록되었습니다." };
}

export async function updateCertificatePrepayment(
  prepaymentId: string,
  input: CertificatePrepaymentFormInput,
): Promise<CertificatePrepaymentMutationResult> {
  const validation = validateCertificatePrepaymentFormInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("certificate_prepayments")
    .select("id, used_at")
    .eq("id", prepaymentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existing) {
    return { success: false, message: "선납결제 내역을 찾을 수 없습니다." };
  }

  if (existing.used_at) {
    return {
      success: false,
      message: "이미 자격증발급신청에 연결되어 사용된 선납결제는 수정할 수 없습니다.",
    };
  }

  const memberId = await resolveMemberIdByLoginId(supabase, normalize(input.memberLoginId));

  if (!memberId) {
    return {
      success: false,
      message: "일치하는 학생 아이디를 찾을 수 없습니다.",
      field: "memberLoginId",
    };
  }

  const updateData: Database["public"]["Tables"]["certificate_prepayments"]["Update"] = {
    member_id: memberId,
    course_id: emptyToNull(input.courseId),
    certificate_name: normalize(input.certificateName),
    amount: input.amount,
    payment_method: input.paymentMethod || null,
    payment_status: input.paymentStatus,
    paid_at: emptyToNull(input.paidAt),
    memo: emptyToNull(input.memo),
  };

  const { error } = await supabase
    .from("certificate_prepayments")
    .update(updateData)
    .eq("id", prepaymentId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "선납결제 내역이 수정되었습니다." };
}

export async function deleteCertificatePrepayment(
  prepaymentId: string,
): Promise<CertificatePrepaymentDeleteResult> {
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("certificate_prepayments")
    .select("id, used_at")
    .eq("id", prepaymentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existing) {
    return { success: false, message: "선납결제 내역을 찾을 수 없습니다." };
  }

  if (existing.used_at) {
    return {
      success: false,
      message: "이미 자격증발급신청에 연결되어 사용된 선납결제는 삭제할 수 없습니다.",
    };
  }

  const { error } = await supabase
    .from("certificate_prepayments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", prepaymentId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "선납결제 내역이 삭제되었습니다." };
}
