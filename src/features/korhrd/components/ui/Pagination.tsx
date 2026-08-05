'use client';

import { useEffect, useState } from 'react';

/**
 * 페이지네이션 (Figma 150:4329)
 * 번호 칸은 데스크톱·태블릿 8개 · 모바일 5개.
 * ‹ › 는 한 칸씩, « » 는 처음·끝으로. 갈 곳이 없으면 화살표를 아예 그리지 않습니다.
 *
 * ⚠ 수강신청(/courses)은 페이지네이션을 쓰지 않고 전체를 한 번에 보여줍니다.
 */
export default function Pagination({
  current, total, onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const [windowSize, setWindowSize] = useState(8);

  useEffect(() => {
    const mq = window.matchMedia('(max-width:560px)');
    const sync = () => setWindowSize(mq.matches ? 5 : 8);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (total <= 1) return null;

  const size = Math.min(windowSize, total);
  /* 현재 페이지를 가운데 두되, 앞뒤 끝에서는 창을 안쪽으로 밀어 항상 size칸을 채웁니다 */
  const start = Math.min(Math.max(1, current - Math.floor((size - 1) / 2)), total - size + 1);
  const nums = Array.from({ length: size }, (_, i) => start + i);

  const arrow = (target: number, cls: string, label: string) => (
    <a href="#" className={`pagination__arrow ${cls}`} aria-label={label}
       onClick={(e) => { e.preventDefault(); onChange(target); }} />
  );

  return (
    <nav className="pagination" aria-label="페이지 이동">
      {current > 1 && arrow(1, 'pagination__arrow--first', '첫 페이지')}
      {current > 1 && arrow(current - 1, 'pagination__arrow--prev', '이전 페이지')}
      {nums.map((n) =>
        n === current ? (
          <span key={n} aria-current="page">{n}</span>
        ) : (
          <a key={n} href="#" onClick={(e) => { e.preventDefault(); onChange(n); }}>{n}</a>
        ),
      )}
      {current < total && arrow(current + 1, 'pagination__arrow--next', '다음 페이지')}
      {current < total && arrow(total, 'pagination__arrow--last', '마지막 페이지')}
    </nav>
  );
}
