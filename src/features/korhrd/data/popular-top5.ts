/**
 * 민간자격증 Top5 — 검색 오버레이 인기 순위 상단 고정과
 * 합격후기 과정 필터의 우선 노출에 함께 씁니다 (2026-08-11 운영 지정).
 *
 * 이름은 DB(courses.name) 기준입니다. 원래 지정된 병원동행매니저·노인돌봄생활지원사는
 * 비노출(hidden) 상태라, 노출 중인 유사 과정(병원코디네이터1급·생활지원사)으로 대체했습니다.
 */
export const PRIVATE_CERT_TOP5 = [
  '병원코디네이터1급',
  '생활지원사',
  '방과후돌봄교실지도사',
  '실버인지활동지도사',
  '심리상담사',
] as const;

/** "심리상담사 1급"·"심리상담사" 처럼 급수 표기만 다른 이름을 같은 과정으로 봅니다. */
export function popularNameKey(name: string): string {
  return name.replace(/\s+/g, '').replace(/[0-9]+급$/, '');
}
