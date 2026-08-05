'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 메인 배너 캐러셀.
 * 슬라이드를 추가하려면 SLIDES 배열에 항목만 넣으면 됩니다 — 점은 개수에 맞춰 자동 생성됩니다.
 * 5초마다 넘어가고, 마우스를 올리면 멈춥니다.
 */
const SLIDES = [
  { src: '/banner-1.png', alt: '정식 등록 민간자격 — 전문자격증 수강료·응시료 0원' },
  { src: '/banner-2.png', alt: '생활지원사 자격 1급 — 전문자격증 수강료·응시료 0원, 보건복지부와 함께합니다' },
  { src: '/banner-3.png', alt: '병원동행매니저 1급 — 전문자격증 수강료·응시료 0원, 보건복지부와 함께합니다' },
];
const AUTO_MS = 5000;

export default function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || SLIDES.length <= 1) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTO_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused]);

  return (
    <div className="banner" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="banner__track" style={{ transform: `translateX(${-index * 100}%)` }}>
        {SLIDES.map((s) => (
          <img className="banner__slide" src={s.src} alt={s.alt} key={s.src} />
        ))}
      </div>
      <div className="banner__dots" role="group" aria-label="배너 선택" hidden={SLIDES.length <= 1}>
        {SLIDES.map((s, i) => (
          <button
            key={s.src} type="button" aria-label={`${i + 1}번 배너`} aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
