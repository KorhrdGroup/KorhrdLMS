'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * 가로 캐러셀 — 메인 직업군, 과정 상세 "이런 분들에게 추천합니다"에서 씁니다.
 *
 * · 한 화면 단위로 페이지를 나눠 점(dot)으로 이동
 * · 마우스로 잡아 끌기 지원 (터치는 브라우저 기본 스크롤·스냅을 그대로 사용)
 * · autoMs 를 주면 자동으로 넘어가고, 마우스를 올리면 멈춥니다
 *
 * 트랙 스타일(칸 폭·스냅)은 CSS에서 정합니다. 예: .job-groups--carousel
 */
export default function Carousel({
  className = '', dotsClassName = 'carousel-dots', autoMs = 0, children,
}: {
  className?: string;
  /** 점 목록의 클래스. 과정 상세 '추천 대상'은 .dwho__dots 로 조금 작습니다 */
  dotsClassName?: string;
  autoMs?: number;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // CSS를 <link>로 비동기 로드하므로 첫 측정 때 폭이 0일 수 있습니다.
    // 0으로 나누면 pages가 Infinity가 되어 Array.from이 터집니다.
    const width = el.clientWidth;
    if (width <= 0) return;
    setPages(Math.max(1, Math.min(50, Math.ceil((el.scrollWidth - 1) / width))));
    setPage(Math.round(el.scrollLeft / width));
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    // 스타일시트가 늦게 적용되면 칸 폭이 바뀌므로 트랙 크기 변화를 직접 지켜봅니다.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, children]);

  useEffect(() => {
    if (!autoMs || pages <= 1) return;
    const t = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % pages;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, autoMs);
    return () => clearInterval(t);
  }, [autoMs, pages]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: Math.min(i * el.clientWidth, el.scrollWidth - el.clientWidth), behavior: 'smooth' });
  };

  return (
    <>
      <div className={className} ref={trackRef}>{children}</div>
      <div className={dotsClassName} aria-label="목록 이동" hidden={pages <= 1}>
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} type="button" aria-label={`${i + 1}번째 목록`}
                  aria-current={i === page} onClick={() => goTo(i)} />
        ))}
      </div>
    </>
  );
}
