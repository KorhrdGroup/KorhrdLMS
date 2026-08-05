'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 과정 상세의 섹션 목차. 스크롤을 따라 상단에 고정되고, 현재 보고 있는 섹션을 표시합니다.
 *
 * · 탭을 누르면 고정 탭 높이만큼 비운 위치로 부드럽게 이동합니다
 *   (목표 지점을 매 프레임 다시 계산합니다 — 스크롤 도중 이미지가 로드돼 레이아웃이 밀려도 정확합니다)
 * · 좁은 화면에서 활성 탭이 화면 밖이면 가로로 끌어옵니다
 * · 오른쪽에 볼 탭이 더 있으면 페이드를 켭니다(.has-more)
 */
const TABS = [
  { id: 'who', label: '추천 대상' },
  { id: 'why', label: '수강 이유' },
  { id: 'reviews', label: '합격후기' },
  { id: 'curriculum', label: '커리큘럼' },
  { id: 'faq', label: 'FAQ' },
];

export default function DetailTabs() {
  const barRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState('who');
  const [hasMore, setHasMore] = useState(false);

  /* 현재 섹션 감지 */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id));
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    TABS.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  /* 오른쪽 페이드 */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const sync = () => setHasMore(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1);
    sync();
    strip.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      strip.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  /* 활성 탭을 가로 중앙으로 */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;
    const tab = strip.querySelector<HTMLElement>(`[href="#${current}"]`);
    if (!tab) return;
    strip.scrollTo({ left: Math.max(0, tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2), behavior: 'smooth' });
  }, [current]);

  const go = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    const offset = barRef.current?.offsetHeight ?? 55;
    window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - offset, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
    setCurrent(id);
  };

  return (
    <nav className={['dtabs', hasMore && 'has-more'].filter(Boolean).join(' ')} aria-label="상세 정보 목차" ref={barRef}>
      <div className="dtabs__in" ref={stripRef}>
        {TABS.map((t) => (
          <a
            key={t.id} href={`#${t.id}`} aria-current={current === t.id}
            onClick={(e) => { e.preventDefault(); go(t.id); }}
          >
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
