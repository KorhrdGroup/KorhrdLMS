"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { NAVER_WCS_ACCOUNT, trackNaverPageView } from "@/lib/naver-analytics.client";

/**
 * 네이버 프리미엄 로그분석 공통 스크립트 — 루트 레이아웃에서 모든 페이지에 심습니다(관리자 화면 제외).
 *
 * 담당자가 준 공통 스크립트(wcslog.js → wcs.inflow() → wcs_do())를 그대로 실행하고(_nasa 는 wcslog.js 가 읽지 않지만 스니펫대로 둠),
 * 이 사이트는 화면 이동이 새로고침 없이 일어나므로(Next.js) 경로가 바뀔 때마다 wcs_do() 를 다시 부릅니다.
 */
export function NaverAnalytics() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  // 마지막으로 페이지뷰를 보낸 경로 — "첫 뷰를 보냈나" 플래그로 하면 관리자 화면에서 넘어올 때
  // 스크립트 onReady 와 경로 effect 가 같은 화면을 두 번 보냅니다(Fable 리뷰 2026-11-03)
  const lastSentPath = useRef<string | null>(null);

  useEffect(() => {
    if (isAdmin) return;
    // 아직 스크립트가 안 떴으면(lastSentPath 없음) onReady 가 첫 뷰를 보냅니다
    if (lastSentPath.current === null || lastSentPath.current === pathname) return;
    trackNaverPageView();
    lastSentPath.current = pathname;
  }, [pathname, isAdmin]);

  if (isAdmin) return null;

  return (
    <Script
      id="naver-wcslog"
      src="https://wcs.naver.net/wcslog.js"
      strategy="afterInteractive"
      // onLoad 는 재마운트 때 다시 안 불려서 onReady 로 (나이스페이 결제창에서 겪은 함정)
      onReady={() => {
        try {
          window.wcs_add = window.wcs_add ?? {};
          window.wcs_add["wa"] = NAVER_WCS_ACCOUNT;
          window._nasa = window._nasa ?? {};
          if (window.wcs && lastSentPath.current !== window.location.pathname) {
            window.wcs.inflow();
            window.wcs_do?.();
            lastSentPath.current = window.location.pathname;
          }
        } catch {
          // 추적 실패는 무시
        }
      }}
    />
  );
}
