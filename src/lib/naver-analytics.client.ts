"use client";

/**
 * 네이버 프리미엄 로그분석(wcs) — 공통 스크립트는 NaverAnalytics 컴포넌트(루트 레이아웃)가 심습니다.
 * 사이트 ID 는 네이버 광고 담당이 준 값입니다(2026-11-03).
 * 스크립트가 아직 안 떴거나 막혔으면 조용히 무시합니다 — 추적 실패가 화면 동작을 깨면 안 됩니다.
 */
export const NAVER_WCS_ACCOUNT = "s_4803431fb6e7";

type Wcs = {
  inflow: (domain?: string) => void;
  trans: (conv: { type: string }) => void;
};

declare global {
  interface Window {
    wcs?: Wcs;
    wcs_add?: Record<string, string>;
    wcs_do?: () => void;
    _nasa?: Record<string, unknown>;
  }
}

/** 페이지뷰 — 첫 로드와 화면 이동(SPA)마다 보냅니다 */
export function trackNaverPageView(): void {
  try {
    if (!window.wcs || !window.wcs_do) return;
    window.wcs_add = window.wcs_add ?? {};
    window.wcs_add["wa"] = NAVER_WCS_ACCOUNT;
    window._nasa = window._nasa ?? {};
    window.wcs_do();
  } catch {
    // 추적 실패는 무시
  }
}

/** 전환(신청 완료) — 담당자가 준 전환 스크립트와 같은 동작: type "lead" 1회 */
export function trackNaverLead(): void {
  try {
    if (!window.wcs) return;
    window.wcs_add = window.wcs_add ?? {};
    window.wcs_add["wa"] = NAVER_WCS_ACCOUNT;
    window.wcs.trans({ type: "lead" });
  } catch {
    // 추적 실패는 무시
  }
}
