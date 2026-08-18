/**
 * 마케팅 유입경로 추적.
 *
 * 마케팅 링크(?utm_source=… [&cafe_id=…|&blog_id=…|&material_id=…|&utm_campaign=…])로
 * 들어온 첫 방문을 쿠키에 담아 두었다가, 회원가입 때 members.referral_source 로 남깁니다.
 * 표기 규칙(대분류_소분류)과 소스 축약은 barosocial 랜딩의 formatClickSource 와 맞춥니다.
 */

export const REFERRAL_COOKIE = "hp_ref";
/** 첫 방문 후 30일 안에 가입하면 유입경로가 남습니다 */
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const SOURCE_LABELS: Record<string, string> = {
  daangn: "당근",
  insta: "인스타",
  instagram: "인스타",
  facebook: "페이스북",
  meta: "인스타·페이스북",
  google: "구글",
  youtube: "유튜브",
  tiktok: "틱톡",
  kakao: "카카오",
  naver: "네이버",
  naverblog: "네이버블로그",
  toss: "토스",
  mamcafe: "맘카페",
};

/**
 * URL 쿼리에서 유입경로 문자열을 만듭니다. 추적 파라미터가 없으면 null.
 * 예: ?utm_source=mamcafe&cafe_id=율하맘 → "맘카페_율하맘"
 */
export function formatReferralSource(params: URLSearchParams): string | null {
  const utmSource = params.get("utm_source");
  if (!utmSource) return null;

  const major = SOURCE_LABELS[utmSource.toLowerCase()] ?? utmSource;
  const minor =
    params.get("cafe_id") ??
    params.get("blog_id") ??
    params.get("material_id") ??
    params.get("utm_campaign");

  // DB 는 "대분류_소분류" 한 컬럼이라 값 안의 _ 는 공백으로 바꿔 둡니다
  const clean = (value: string) => value.trim().replaceAll("_", " ").slice(0, 60);
  return minor ? `${clean(major)}_${clean(minor)}` : clean(major);
}

/** 리퍼러 호스트 → 유입경로 라벨. 우리 도메인·검색엔진 외 주요 채널만 잡습니다. */
const REFERRER_HOSTS: Array<{ match: RegExp; label: string }> = [
  { match: /(^|\.)cafe\.naver\.com$/, label: "네이버카페" },
  { match: /(^|\.)blog\.naver\.com$/, label: "네이버블로그" },
  { match: /(^|\.)band\.us$/, label: "네이버밴드" },
  { match: /(^|\.)instagram\.com$/, label: "인스타" },
  { match: /(^|\.)facebook\.com$/, label: "페이스북" },
  { match: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/, label: "유튜브" },
  { match: /(^|\.)daangn\.com$/, label: "당근" },
  { match: /(^|\.)tiktok\.com$/, label: "틱톡" },
  { match: /(^|\.)kakao\.com$|(^|\.)pf\.kakao\.com$/, label: "카카오" },
];

/**
 * 파라미터 없는 맨주소 링크로 들어온 경우의 폴백 — 리퍼러로 유입 채널을 추정합니다.
 * 카페 글처럼 utm 을 못 붙인 링크도 최소 "네이버카페" 까지는 남습니다.
 * (브라우저 리퍼러 정책상 대개 도메인만 넘어와, 어느 카페인지까지는 utm 링크가 필요합니다.
 *  네이버카페는 경로 첫 조각이 카페 아이디로 오는 경우가 있어 있으면 소분류로 남깁니다.)
 */
export function formatReferrerFallback(referrer: string): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    const hit = REFERRER_HOSTS.find((entry) => entry.match.test(host));
    if (!hit) return null;

    if (hit.label === "네이버카페") {
      const seg = url.pathname.split("/").filter(Boolean)[0];
      // "ca-fe" 등 카페 아이디가 아닌 공통 경로는 제외합니다
      if (seg && /^[a-z0-9-]{2,20}$/i.test(seg) && seg.toLowerCase() !== "ca-fe") {
        return `네이버카페_${seg}`;
      }
    }
    return hit.label;
  } catch {
    return null;
  }
}
