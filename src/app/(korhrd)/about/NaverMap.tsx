'use client';

/**
 * 오시는 길 지도 — 네이버 Web Dynamic Map (maps.js v3)
 *
 * NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 가 없으면 지도를 그리지 않고
 * 주소·길찾기 링크만 보여줍니다(키가 없어도 페이지가 깨지지 않게).
 *
 * 키 발급: NCP 콘솔 > Services > Application Services > Maps > Application
 *   - Dynamic Map 체크 필수 (없으면 429 Quota Exceed)
 *   - Web 서비스 URL 에 localhost:3000 / vercel 주소 / 실서비스 도메인 모두 등록
 */

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

/** 씨드큐브 창동 (서울 도봉구 마들로13길 61) */
const LAT = 37.65454;
const LNG = 127.049926;
const PLACE = '한평생직업훈련';
const ADDRESS = '서울시 도봉구 창동 마들로13길 61 씨드큐브 905호';

/** 네이버 지도 앱·웹에서 길찾기 — 좌표를 함께 넘겨 검색 결과가 갈리지 않게 합니다 */
const NAVER_MAP_URL = `https://map.naver.com/p/search/${encodeURIComponent(ADDRESS)}?c=${LNG},${LAT},17,0,0,0,dh`;

const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

const BOX_STYLE: React.CSSProperties = {
  width: '100%',
  height: 'clamp(260px, 45vw, 360px)',
  borderRadius: '8px',
  overflow: 'hidden',
};

export default function NaverMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const [failed, setFailed] = useState(false);

  // 지도 인스턴스는 컴포넌트가 사라질 때 함께 정리합니다.
  useEffect(() => {
    return () => {
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  function drawMap() {
    if (!ref.current || mapRef.current || !window.naver) return;

    const position = new naver.maps.LatLng(LAT, LNG);
    mapRef.current = new naver.maps.Map(ref.current, {
      center: position,
      zoom: 17,
      // 페이지를 스크롤하다 지도 위에서 확대돼 버리는 것을 막습니다.
      scrollWheel: false,
    });
    new naver.maps.Marker({ position, map: mapRef.current, title: PLACE });
  }

  const showFallback = !CLIENT_ID || failed;

  return (
    <>
      {showFallback ? (
        <div
          style={{
            ...BOX_STYLE,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'var(--surface-alt, #F2F4F7)',
            border: '1px solid var(--line, #E4E4E4)',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <strong>{PLACE}</strong>
          <span style={{ color: 'var(--muted, #6b6b6b)' }}>{ADDRESS}</span>
        </div>
      ) : (
        <div ref={ref} style={BOX_STYLE} aria-label={`${PLACE} 위치 지도`} role="img" />
      )}

      <p className="mt-2">
        <a href={NAVER_MAP_URL} target="_blank" rel="noopener noreferrer">
          네이버 지도에서 길찾기
        </a>
      </p>

      {CLIENT_ID && (
        <Script
          strategy="afterInteractive"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`}
          onReady={drawMap}
          onError={() => setFailed(true)}
        />
      )}
    </>
  );
}
