'use client';

import { useEffect, useState } from 'react';

import styles from './ScrollTopButton.module.css';

/**
 * 오른쪽 아래 '맨 위로' 버튼 — Figma button_top (334:9610)
 * https://figma.com/design/jIRU9Nf4klrKpzgtdhW3br?node-id=334-9610
 *
 * 시안은 54×54 · 흰 배경 · 1px #E4E4E4 테두리 · radius 8 · 화살표 20px ·
 * 'TOP' 14px SemiBold #656565. 색은 전부 사이트 토큰과 그대로 맞아떨어집니다
 * (#656565=--muted · #E4E4E4=--line · #FFF=--surface).
 *
 * 시안에 없는 두 가지는 이렇게 정했습니다.
 *  · 언제 보이나 — 한 화면 넘게 내려갔을 때만. 맨 위에서도 떠 있으면
 *    가릴 것만 늘고 누를 이유가 없습니다.
 *  · 어디에 서나 — 아래에 겹치는 것들(모바일 탭바 · 수강신청 장바구니 바)
 *    위로 올라오도록 module.css 에서 자리를 잡습니다.
 */
export default function ScrollTopButton() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      className={shown ? `${styles.top} ${styles.shown}` : styles.top}
      type="button" onClick={toTop}
      aria-label="맨 위로"
      /* 숨어 있을 때는 키보드·보조기기에서도 잡히지 않아야 합니다 */
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
    >
      {/* 시안에서 받은 원본 아이콘입니다(tabler:arrow-up) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/arrow-up.svg" alt="" width={20} height={20} aria-hidden="true" />
      TOP
    </button>
  );
}
