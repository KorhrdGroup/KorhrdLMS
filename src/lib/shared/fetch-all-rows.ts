/**
 * Supabase(PostgREST)는 한 번에 최대 1,000행만 돌려주고, 넘치는 행은 **오류 없이 잘라** 버립니다.
 * (2026-09-23 실측: 자격증신청 9,009건 중 엑셀에 1,000건만 들어감)
 * 엑셀처럼 "전부"가 필요한 조회는 이 함수로 1,000행씩 끝까지 이어 받을 것.
 *
 * `page(from, to)` 는 매번 **새 쿼리**를 만들어 `.range(from, to)` 를 붙여 돌려줘야 하고,
 * 정렬은 반드시 유일한 열(id)로 끝나야 합니다 — 동률이 있으면 페이지 사이로 행이 빠지거나 겹칩니다.
 */
export const SUPABASE_MAX_ROWS = 1000;

export async function fetchAllRows<T>(
  page: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += SUPABASE_MAX_ROWS) {
    const { data, error } = await page(from, from + SUPABASE_MAX_ROWS - 1);
    if (error) {
      throw new Error(error.message);
    }
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < SUPABASE_MAX_ROWS) {
      return rows;
    }
  }
}
