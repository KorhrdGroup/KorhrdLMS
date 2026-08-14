/**
 * 소셜 로그인 콜백 주소에 쓸 "사용자가 실제 접속한" origin.
 *
 * Vercel 뒤에서는 request.url 이 커스텀 도메인이 아니라 내부 배포 주소로
 * 잡히므로, 프록시가 넣어주는 x-forwarded-host / host 헤더를 우선합니다.
 */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  if (!host) return new URL(request.url).origin;

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
