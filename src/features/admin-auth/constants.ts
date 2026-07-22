/**
 * 어드민 세션 유효기간(24시간) 마커 쿠키.
 * Supabase Auth 세션은 refresh 토큰으로 자동 갱신되어 사실상 무기한 유지되므로,
 * 이 마커 쿠키의 브라우저 만료(maxAge)로 24시간 하드 리밋을 강제합니다.
 * proxy에서 이 쿠키가 없으면(=24시간 경과) 로그인 화면으로 보냅니다.
 */
export const ADMIN_SESSION_MARKER_COOKIE = "admin_session_active";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
