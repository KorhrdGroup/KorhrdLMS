/**
 * 어드민 공통 디자인 토큰 — Toss TDS Mobile 팔레트 기반.
 * (폰트 Toss Product Sans는 재배포 권리가 없어 시스템 폰트로 폴백)
 * 오렌지 톤에서 토스블루 톤으로 전면 교체. 회원/과정/카테고리/차시 화면이 공유합니다.
 */
export const M = {
  ink: "#191f28", // foreground — 제목/강조/헤어라인 상단선
  text: "#4e5968", // body — 기본 본문/표 값
  body: "#4e5968", // body — 보조 본문
  mute: "#8b95a1", // muted — 라벨/날짜/플레이스홀더
  line: "#e5e8eb", // border — 얇은 구분선
  border: "#e5e8eb", // border — 인풋/버튼 아웃라인
  hover: "#f2f4f6", // surface — 호버/비활성 배경
  accent: "#3182f6", // primary — 주요 액션
  accentDim: "#2272eb", // primary-hover
  weakBg: "#e8f3ff", // weak-background — 약한 강조 배경(성공/안내)
  weakFg: "#1b64da", // weak-foreground
  danger: "#e42939", // 파괴/오류
} as const;

/** 회원목록 표 컬럼 그리드(삭제회원 보기 여부에 따라 마지막 관리 열 추가). */
export function memberGridColumns(showDeleted: boolean) {
  const base = "36px 44px 110px 1fr 130px 1.3fr 1.2fr 100px 130px 70px";
  return showDeleted ? `${base} 90px` : base;
}
