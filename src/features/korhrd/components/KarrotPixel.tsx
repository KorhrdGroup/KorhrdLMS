'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { trackKarrotEvent } from '@/lib/karrot-pixel.client';

const PIXEL_ID = process.env.NEXT_PUBLIC_KARROT_PIXEL_ID;

/**
 * 당근 비즈니스 전환 추적 공통 스크립트 — (korhrd) 레이아웃에서 전 페이지에 심습니다.
 *
 * 픽셀 ID(NEXT_PUBLIC_KARROT_PIXEL_ID)가 없으면 아무것도 렌더하지 않으므로,
 * 당근 전문가모드 > 전환 추적 관리에서 코드 ID를 받아 환경변수로 넣으면 켜집니다.
 * SPA 라우팅에서도 페이지뷰가 잡히도록 경로가 바뀔 때마다 ViewPage를 보냅니다.
 */
export default function KarrotPixel() {
  const pathname = usePathname();
  const firstViewSent = useRef(false);

  useEffect(() => {
    if (!PIXEL_ID) return;
    // 최초 ViewPage는 아래 인라인 스크립트가 보냅니다 — 경로 변경분만 추가 전송
    if (!firstViewSent.current) {
      firstViewSent.current = true;
      return;
    }
    trackKarrotEvent('ViewPage');
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <Script id="karrot-pixel" strategy="afterInteractive">
      {`(function (w, d) {
  if (w.karrotPixel) return;
  var k = { stub: true, queue: [] };
  k.init = function () { k.queue.push(['init', arguments, Date.now()]); };
  k.track = function () { k.queue.push(['track', arguments, Date.now()]); };
  w.karrotPixel = k;
  var s = d.createElement('script');
  s.async = true;
  s.src = 'https://karrot-pixel.business.daangn.com/karrot-pixel.js';
  var f = d.getElementsByTagName('script')[0];
  f && f.parentNode ? f.parentNode.insertBefore(s, f) : d.head.appendChild(s);
})(window, document);
window.karrotPixel.init('${PIXEL_ID}');
window.karrotPixel.track('ViewPage');`}
    </Script>
  );
}
