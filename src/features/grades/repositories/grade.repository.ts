/**
 * 성적관리는 출석점수(출석률)만 관리자가 직접 수정할 수 있고, 시험/과제 점수는
 * exam-management·assignment-management 쪽 데이터를 그대로 참조합니다.
 * 지금은 Supabase에 `grades` 테이블이 없어 enrollment id를 key로 하는 서버
 * 메모리 저장소로 출석률 보정값만 보관합니다.
 *
 * 추후 Supabase `grades` 테이블(enrollment_id, attendance_rate, updated_at 등)이
 * 생기면 이 파일의 함수 구현부만 실제 테이블 쿼리로 교체하면 됩니다.
 */
type GradeOverrideRecord = {
  attendanceRate: number;
  updatedAt: string;
};

const attendanceOverrides = new Map<string, GradeOverrideRecord>();

export function getAttendanceOverride(enrollmentId: string): number | null {
  return attendanceOverrides.get(enrollmentId)?.attendanceRate ?? null;
}

export function setAttendanceOverride(
  enrollmentId: string,
  attendanceRate: number,
): void {
  attendanceOverrides.set(enrollmentId, {
    attendanceRate,
    updatedAt: new Date().toISOString(),
  });
}

export function clearAttendanceOverride(enrollmentId: string): void {
  attendanceOverrides.delete(enrollmentId);
}
