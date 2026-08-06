'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * 칩 한 줄. 실제로 넘칠 때만 라벨을 고정합니다.
 * (넘치지 않는 줄에 흰 배경을 깔면 첫 칩과 겹쳐 보입니다)
 *
 * group 을 주면 data-goal-group · data-age-group 을 답니다. 메인 목적·연령 줄의
 * 칩 모양(테두리·높이·숫자 크기)이 이 속성 선택자에 걸려 있어서,
 * 빠지면 .pill 공통 스타일만 남아 테두리 없는 다른 칩이 됩니다 (appendix.css 11절).
 */
export default function PillRow({ label, group, children }: {
  label: string;
  group?: 'goal' | 'age';
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => setScrollable(el.scrollWidth - el.clientWidth > 2);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [children]);

  return (
    <div
      className={['pill-row', scrollable && 'is-scrollable'].filter(Boolean).join(' ')}
      ref={ref}
      data-goal-group={group === 'goal' ? '' : undefined}
      data-age-group={group === 'age' ? '' : undefined}
    >
      <span className="pill-row__label">{label}</span>
      {children}
    </div>
  );
}
