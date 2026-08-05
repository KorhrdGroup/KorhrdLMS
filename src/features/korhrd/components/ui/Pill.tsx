'use client';

/**
 * 목적·연령 필터 칩.
 * 좁은 화면에서는 줄바꿈 대신 한 줄 스크롤이 되고, 넘칠 때만 라벨이 고정됩니다
 * (styles/appendix.css 의 .pill-row.is-scrollable 참고 — 클래스는 PillRow 가 붙입니다)
 */
export function Pill({
  active, count, children, onClick,
}: {
  active?: boolean;
  count?: number;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="pill" type="button" aria-pressed={active} onClick={onClick}>
      {children}
      {count !== undefined && <b>{count}</b>}
    </button>
  );
}
