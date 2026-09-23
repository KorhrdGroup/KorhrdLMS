/**
 * `.in("col", ids)` 필터용 묶음 크기.
 *
 * Supabase(PostgREST)는 필터를 URL 쿼리에 싣고, 응답 헤더(Content-Location)에 그 쿼리를
 * 그대로 되돌려 줍니다. 그래서 id 가 많으면 두 가지로 깨집니다 (2026-09-23 실측, UUID 기준):
 *   - URL 약 18KB(≈500개)부터 응답 헤더가 16KB를 넘어 서버 Node fetch 가 "fetch failed"
 *   - URL 약 30KB(≈800개)부터 게이트웨이가 HTTP 400 "Bad Request"
 * 150개면 URL 약 5.6KB 로 넉넉합니다. 목록이 긴 조회(엑셀 등)는 반드시 이걸로 나눠 부를 것.
 */
export const IN_FILTER_CHUNK_SIZE = 150;

export function chunk<T>(items: readonly T[], size: number = IN_FILTER_CHUNK_SIZE): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}
