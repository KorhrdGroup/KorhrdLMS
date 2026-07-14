import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type AvailableCertificatePrepayment = {
  id: string;
  amount: number;
};

type AvailablePrepaymentRow = {
  id: string;
  amount: number;
  course_id: string | null;
  created_at: string;
};

/**
 * 특정 학생에게 사용 가능한(미사용/미삭제/입금확인 완료) 선납결제를 찾습니다.
 * 특정 과정에 한정된 선납결제(course_id 일치)를 과정 무관 범용 선납결제(course_id
 * NULL)보다 우선 사용하고, 동일 조건이면 먼저 등록된 건부터 사용합니다.
 *
 * 자격증발급신청 화면 결제금액 미리보기(`certificate-application.service.ts`의
 * `getCertificateApplicationPageData`)와 실제 제출 시 자동 연결
 * (`submitCertificateApplication`)에서 공통으로 사용해, 미리보기와 실제 처리 결과가
 * 항상 일치하도록 합니다.
 */
export async function findAvailableCertificatePrepayment(
  supabase: SupabaseServerClient,
  memberId: string,
  courseId: string,
): Promise<AvailableCertificatePrepayment | null> {
  const { data, error } = await supabase
    .from("certificate_prepayments")
    .select("id, amount, course_id, created_at")
    .eq("member_id", memberId)
    .eq("payment_status", "paid")
    .is("deleted_at", null)
    .is("used_at", null)
    .or(`course_id.eq.${courseId},course_id.is.null`)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as AvailablePrepaymentRow[];
  const matched =
    rows.find((row) => row.course_id === courseId) ?? rows.find((row) => row.course_id === null);

  return matched ? { id: matched.id, amount: matched.amount } : null;
}

/**
 * 선택된 선납결제를 자격증발급신청에 연결(사용 처리)합니다. 동시성 문제를 최소화하기
 * 위해 `used_at IS NULL` 조건을 걸고 업데이트하며, 이미 다른 요청이 먼저 사용 처리한
 * 경우(반환된 row가 없는 경우)에는 호출부에서 무시해도 안전합니다 — 신청 건은 이미
 * 계산된 금액으로 저장되었고, 관리자가 발급신청관리 화면에서 실결제금액/결제상태를
 * 다시 조정할 수 있습니다.
 */
export async function markCertificatePrepaymentUsed(
  supabase: SupabaseServerClient,
  prepaymentId: string,
  certificateApplicationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("certificate_prepayments")
    .update({
      used_at: new Date().toISOString(),
      certificate_application_id: certificateApplicationId,
    })
    .eq("id", prepaymentId)
    .is("used_at", null)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
