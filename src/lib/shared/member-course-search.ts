import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** 회원 후보를 이만큼까지만 모읍니다 — member_id.in.(…) 이 URL 에 실리므로 길이 한도(≈500개) 아래로 둡니다 */
const MAX_MEMBER_MATCHES = 300;

/** PostgREST or() 안의 값은 쉼표·괄호가 들어가면 깨지므로 따옴표로 감쌉니다 */
function quoteOrValue(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

/**
 * "전체" 검색 — 회원 이름·아이디·과정명(+ 그 테이블 자체 열)을 한 번에 OR 로 찾는 필터 문자열.
 *
 * 조인한 두 테이블(member·course)의 열을 최상위 or() 에 섞어 쓰면 PostgREST 가
 * "failed to parse logic tree" 로 거절합니다(2026-10-02 결제관리 검색 오류). 그래서 회원·과정을
 * 먼저 각각 찾아 id 로 바꾼 뒤 `member_id.in.(…) , course_id.in.(…)` 로 거릅니다.
 * 대상 테이블에 member_id · course_id 열이 있어야 합니다(enrollments 기준).
 *
 * 결과는 `builder.or(…)` 에 그대로 넣으면 됩니다. 아무것도 안 맞으면 결과가 0건이 되는
 * 조건을 돌려줍니다.
 */
export async function buildMemberCourseSearchOr(
  supabase: SupabaseServerClient,
  search: string,
  /** 대상 테이블 자체에서도 함께 찾을 열 (예: ["batch"]) */
  ownColumns: string[] = [],
): Promise<string> {
  const keyword = `%${search.trim()}%`;

  const [{ data: members, error: memberError }, { data: courses, error: courseError }] =
    await Promise.all([
      supabase
        .from("members")
        .select("id")
        .or(`name.ilike.${quoteOrValue(keyword)},login_id.ilike.${quoteOrValue(keyword)}`)
        .limit(MAX_MEMBER_MATCHES),
      supabase.from("courses").select("id").ilike("name", keyword),
    ]);
  if (memberError) throw new Error(memberError.message);
  if (courseError) throw new Error(courseError.message);

  const parts: string[] = [];
  const memberIds = (members ?? []).map((row) => row.id);
  const courseIds = (courses ?? []).map((row) => row.id);
  if (memberIds.length > 0) parts.push(`member_id.in.(${memberIds.join(",")})`);
  if (courseIds.length > 0) parts.push(`course_id.in.(${courseIds.join(",")})`);
  for (const column of ownColumns) parts.push(`${column}.ilike.${quoteOrValue(keyword)}`);

  // 맞는 게 하나도 없으면 아무 행도 안 걸리는 조건(id 는 null 일 수 없음)
  return parts.length > 0 ? parts.join(",") : "id.is.null";
}
