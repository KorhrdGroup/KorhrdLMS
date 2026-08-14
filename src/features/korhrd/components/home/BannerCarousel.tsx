'use client';

import { useEffect, useRef, useState } from 'react';

export type BannerSlide = { src: string; alt: string; href?: string | null };

/**
 * 메인 배너 캐러셀.
 * 어드민 배너관리(/admin/banners)에서 등록한 배너를 slides로 받고,
 * 등록된 배너가 없으면 기본 배너(DEFAULT_SLIDES)로 폴백합니다.
 * 5초마다 넘어가고, 마우스를 올리면 멈춥니다.
 */
const DEFAULT_SLIDES: BannerSlide[] = [
  { src: '/banner-1.png', alt: '정식 등록 민간자격 — 전문자격증 수강료·응시료 0원' },
  { src: '/banner-2.png', alt: '생활지원사 자격 1급 — 전문자격증 수강료·응시료 0원, 보건복지부와 함께합니다' },
  { src: '/banner-3.png', alt: '병원동행매니저 1급 — 전문자격증 수강료·응시료 0원, 보건복지부와 함께합니다' },
];
const AUTO_MS = 5000;

export default function BannerCarousel({ slides }: { slides?: BannerSlide[] }) {
  const items = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % items.length), AUTO_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, items.length]);

  return (
    <div className="banner" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="banner__track" style={{ transform: `translateX(${-index * 100}%)` }}>
        {items.map((s) => (
          s.href ? (
            <a key={s.src} href={s.href} style={{ display: 'block', flex: '0 0 100%' }}>
              <img className="banner__slide" src={s.src} alt={s.alt} style={{ width: '100%' }} />
            </a>
          ) : (
            <img className="banner__slide" src={s.src} alt={s.alt} key={s.src} />
          )
        ))}
      </div>
      <div className="banner__dots" role="group" aria-label="배너 선택" hidden={items.length <= 1}>
        {items.map((s, i) => (
          <button
            key={s.src} type="button" aria-label={`${i + 1}번 배너`} aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
