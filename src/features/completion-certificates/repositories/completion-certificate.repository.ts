import { generateCertificateNumber } from "@/features/completion-certificates/lib/completion-certificate-number";
import { createClient } from "@/lib/supabase/server";

/**
 * 과정 수료증(`completion_certificates`) 발급 이력을 Supabase에 저장합니다.
 * enrollment 1건당 활성(취소되지 않은) 수료증은 1개만 존재하도록 DB의 부분
 * unique index(`completion_certificates_active_enrollment_unique`)로 보장합니다.
 * 발급취소는 `canceled_at`을 채우는 소프트 삭제 방식이라 이후 재발급 시
 * 새 행을 추가합니다.
 */
export type CertificateRecord = {
  certificateNumber: string;
  issuedAt: string;
  reissueCount: number;
};

type CompletionCertificateRow = {
  certificate_number: string;
  issued_at: string;
  reissue_count: number;
};

function toRecord(row: CompletionCertificateRow): CertificateRecord {
  return {
    certificateNumber: row.certificate_number,
    issuedAt: row.issued_at,
    reissueCount: row.reissue_count,
  };
}

export async function getCertificateRecord(enrollmentId: string): Promise<CertificateRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("completion_certificates")
    .select("certificate_number, issued_at, reissue_count")
    .eq("enrollment_id", enrollmentId)
    .is("canceled_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toRecord(data) : null;
}

/**
 * 여러 enrollment의 발급 여부를 한 번의 쿼리로 조회합니다.
 * 회원목록의 "수강과정" 요약처럼 다건을 한 화면에서 표시할 때 enrollment마다
 * 개별 조회(N+1)하지 않도록 배치 조회용으로 제공합니다.
 */
export async function getCertificateRecordsByEnrollmentIds(
  enrollmentIds: string[],
): Promise<Map<string, CertificateRecord>> {
  if (enrollmentIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("completion_certificates")
    .select("enrollment_id, certificate_number, issued_at, reissue_count")
    .in("enrollment_id", enrollmentIds)
    .is("canceled_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, CertificateRecord>();
  for (const row of data ?? []) {
    map.set(row.enrollment_id, toRecord(row));
  }

  return map;
}

export async function issueCertificateRecord(
  enrollmentId: string,
  courseId: string,
  memberId: string,
): Promise<CertificateRecord> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("completion_certificates")
    .insert({
      enrollment_id: enrollmentId,
      course_id: courseId,
      member_id: memberId,
      certificate_number: generateCertificateNumber(courseId),
      issued_at: now,
      reissue_count: 0,
    })
    .select("certificate_number, issued_at, reissue_count")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toRecord(data);
}

export async function reissueCertificateRecord(enrollmentId: string): Promise<CertificateRecord | null> {
  const supabase = await createClient();
  const existing = await getCertificateRecord(enrollmentId);

  if (!existing) {
    return null;
  }

  const { data, error } = await supabase
    .from("completion_certificates")
    .update({
      issued_at: new Date().toISOString(),
      reissue_count: existing.reissueCount + 1,
    })
    .eq("enrollment_id", enrollmentId)
    .is("canceled_at", null)
    .select("certificate_number, issued_at, reissue_count")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toRecord(data);
}

export async function cancelCertificateRecord(enrollmentId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("completion_certificates")
    .update({ canceled_at: new Date().toISOString() })
    .eq("enrollment_id", enrollmentId)
    .is("canceled_at", null)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  return (data?.length ?? 0) > 0;
}
