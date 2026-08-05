'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * 칩 한 줄. 실제로 넘칠 때만 라벨을 고정합니다.
 * (넘치지 않는 줄에 흰 배경을 깔면 첫 칩과 겹쳐 보입니다)
 */
export default function PillRow({ label, children }: { label: string; children: ReactNode }) {
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
    <div className={['pill-row', scrollable && 'is-scrollable'].filter(Boolean).join(' ')} ref={ref}>
      <span className="pill-row__label">{label}</span>
      {children}
    </div>
  );
}
