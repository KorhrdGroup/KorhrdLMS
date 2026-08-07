import { createClient } from "@/lib/supabase/server";

/**
 * korhrd 화면(수강신청 목록·홈 목적별 카드)의 과정 썸네일을 DB에서 읽어옵니다.
 *
 * `features/korhrd/data/courses.ts`의 `thumb`는 DB 동기화 "스냅샷"이라
 * 어드민 과정관리에서 썸네일을 바꿔도 그대로 남습니다(상세페이지는 DB를 직접 읽어
 * 바로 바뀌는데 목록만 안 바뀌던 원인). 그래서 목록 화면에서는 이 맵을 덮어씁니다.
 *
 * 키는 두 벌입니다:
 *  - `courses.code` (예: CRS-KH-0001) — 정상 경로
 *  - 정규화한 과정명 — 코드가 어긋난 과정을 위한 보조 경로. 상세페이지
 *    (`getCourseDetail`)와 같은 규칙(공백 제거 + 끝의 "N급" 제거)을 씁니다.
 */
export type CourseThumbnailMap = Record<string, string>;

export function normalizeCourseName(value: string) {
  return value.replace(/\s+/g, "").replace(/\d급$/, "");
}

export async function getCourseThumbnailMap(): Promise<CourseThumbnailMap> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("code, name, thumbnail_url")
      .is("deleted_at", null)
      .not("thumbnail_url", "is", null);

    if (error) {
      return {};
    }

    const map: CourseThumbnailMap = {};
    for (const row of (data ?? []) as {
      code: string | null;
      name: string | null;
      thumbnail_url: string | null;
    }[]) {
      const url = row.thumbnail_url?.trim();
      if (!url) continue;
      if (row.code) map[row.code] = url;
      // 이름 키는 코드 키를 덮지 않도록 뒤에 둡니다(같은 이름의 과정이 있어도 안전).
      if (row.name) {
        const nameKey = `name:${normalizeCourseName(row.name)}`;
        map[nameKey] ??= url;
      }
    }

    return map;
  } catch {
    // 썸네일은 화면 필수 요소가 아니므로, 조회 실패 시 스냅샷 이미지를 그대로 씁니다.
    return {};
  }
}
