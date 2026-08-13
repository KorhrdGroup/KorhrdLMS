import { createClient } from "@/lib/supabase/server";

/**
 * 학생 화면에 내보낼 과정 코드 목록.
 *
 * 과정 카탈로그(`data/courses.ts`)는 퍼블리싱 원본을 그대로 옮긴 **하드코딩 84개**라
 * 어드민에서 과정을 비노출(hidden)로 돌려도 목록에서 사라지지 않았습니다.
 * 실제로 자료(영상·교안·시험)가 없는 22개 과정이 수강신청 목록에 떠 있었고,
 * 신청하면 빈 강의실로 들어갔습니다 (2026-08-13 확인).
 *
 * 그래서 **노출 여부만 DB에서 읽어** 카탈로그를 거릅니다. 카드에 쓰는 나머지 값
 * (가격·교수명·분류 등)은 그대로 카탈로그를 씁니다 — 화면을 바꾸지 않기 위해서입니다.
 *
 * DB를 못 읽으면 빈 화면 대신 **카탈로그 전체**를 그대로 보여줍니다(널 반환).
 * 목록이 통째로 비는 쪽이 몇 개 더 보이는 것보다 나쁩니다.
 */
export async function getVisibleCourseCodes(): Promise<Set<string> | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("code")
      .eq("status", "active")
      .is("deleted_at", null);

    if (error || !data) return null;

    const codes = data
      .map((row) => (row as { code: string | null }).code)
      .filter((code): code is string => Boolean(code));

    return codes.length > 0 ? new Set(codes) : null;
  } catch {
    return null;
  }
}
