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
  className = '', dotsClassName = 'carousel-dots',
  label, dotsLabel = '목록 이동', autoMs = 0, pageBy = 'width', children,
}: {
  className?: string;
  /** 점 목록의 클래스. 과정 상세 '추천 대상'은 .dwho__dots 로 조금 작습니다 */
  dotsClassName?: string;
  /** 트랙의 aria-label (원본 jobs.html 은 '직업군 선택') */
  label?: string;
  /** 점 목록의 aria-label (원본 initJobCarousel 은 '직업군 목록 이동') */
  dotsLabel?: string;
  autoMs?: number;
  /**
   * 점 개수를 세는 방식 — 원본이 화면마다 다릅니다.
   *
   *  'width' : 트랙 폭 ÷ 화면 폭 (원본 initJobCarousel · 취업 길찾기)
   *  'cards' : 칸 개수 ÷ 한 화면에 들어가는 칸 수 (원본 buildCarousel · 메인)
   *
   * 메인에서 'width' 를 쓰면 안 됩니다. 트랙이 화면의 2.008배라 점이 3개
   * 생기는데 끝까지 밀어도 round(1170/1160)=1 이라 마지막 점은 켜지지
   * 않습니다. 원본은 칸 수로 세어 2개만 만듭니다.
   */
  pageBy?: 'width' | 'cards';
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

    let count: number;
    if (pageBy === 'cards') {
      /* 원본 buildCarousel — 한 화면에 몇 칸이 들어가는지로 셉니다.
         칸 사이 간격은 CSS(gap)에서 읽습니다. 원본은 16을 고정으로 썼지만
         트랙마다 gap 이 달라 실제 값을 씁니다. */
      const first = el.firstElementChild as HTMLElement | null;
      const cardW = first?.offsetWidth ?? 0;
      if (cardW <= 0) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const per = Math.max(1, Math.round(width / (cardW + gap)));
      count = Math.ceil(el.children.length / per);
    } else {
      count = Math.ceil((el.scrollWidth - 1) / width);
    }

    const pagesCount = Math.max(1, Math.min(50, count));
    setPages(pagesCount);
    /* 트랙이 화면의 정수배가 아니면(마지막 페이지가 반쪽) 끝까지 밀어도
       round 로는 마지막 페이지 번호가 안 나옵니다 — 끝에 닿았으면 마지막으로. */
    const maxScroll = el.scrollWidth - width;
    setPage(
      maxScroll > 0 && el.scrollLeft >= maxScroll - 1
        ? pagesCount - 1
        : Math.round(el.scrollLeft / width),
    );
  }, [pageBy]);

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
      <div className={className} ref={trackRef} aria-label={label}>{children}</div>
      <div className={dotsClassName} aria-label={dotsLabel} hidden={pages <= 1}>
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} type="button" aria-label={`${i + 1}번째 목록 보기`}
                  aria-current={i === page} onClick={() => goTo(i)} />
        ))}
      </div>
    </>
  );
}
