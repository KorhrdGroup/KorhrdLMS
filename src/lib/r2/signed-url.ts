import { createHmac } from "node:crypto";

/**
 * videokorhrd.com(R2 커스텀 도메인) 미디어 주소에 만료시각 서명을 붙입니다.
 *
 * Cloudflare Worker(cloudflare/video-gate)가 같은 비밀키로 서명을 검증해,
 * 주소가 밖으로 새어나가도 유효기간이 지나면 재생되지 않습니다.
 *
 * - 비밀키(VIDEO_URL_SIGNING_SECRET)가 없으면 원본 주소를 그대로 반환합니다
 *   — Worker 미배포 상태에서는 서명 파라미터가 무시되므로 어느 순서로
 *   배포해도 화면이 깨지지 않습니다.
 * - videokorhrd.com 이외의 주소(외부 영상 등)는 건드리지 않습니다.
 * - 서명 대상 문자열은 Worker와 동일하게 "디코드된 경로(NFC 정규화):만료초"입니다
 *   — 한글 경로의 퍼센트 인코딩/NFD 차이로 서명이 어긋나는 것을 막습니다.
 */

const PROTECTED_HOST = "videokorhrd.com";
const DEFAULT_TTL_SECONDS = 6 * 60 * 60;

export function signProtectedMediaUrl(
  url: string | null,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string | null {
  if (!url) return url;

  const secret = process.env.VIDEO_URL_SIGNING_SECRET?.trim();
  if (!secret) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.hostname !== PROTECTED_HOST) return url;

  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const path = decodeURIComponent(parsed.pathname).normalize("NFC");
  const signature = createHmac("sha256", secret)
    .update(`${path}:${expires}`)
    .digest("hex");

  parsed.searchParams.set("ex", String(expires));
  parsed.searchParams.set("sig", signature);
  return parsed.toString();
}
