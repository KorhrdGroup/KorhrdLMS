"use client";

/**
 * 당근 비즈니스 전환 추적(카롯 픽셀) 이벤트 헬퍼.
 *
 * 공통 스크립트는 KarrotPixel 컴포넌트((korhrd) 레이아웃)가 심습니다.
 * 픽셀 ID(NEXT_PUBLIC_KARROT_PIXEL_ID)가 없거나 스크립트가 아직 안 떴으면
 * 조용히 무시합니다 — 추적 실패가 화면 동작을 깨면 안 됩니다.
 */

type KarrotPixel = {
  init: (id: string) => void;
  track: (event: string) => void;
};

declare global {
  interface Window {
    karrotPixel?: KarrotPixel;
  }
}

/** 당근 표준 이벤트 이름 (docs: business.daangn.com 전환 추적) */
export type KarrotEvent =
  | "ViewPage"
  | "Login"
  | "CompleteRegistration"
  | "ViewContent"
  | "AddToCart"
  | "Purchase"
  | "Lead"
  | "SubmitApplication";

export function trackKarrotEvent(event: KarrotEvent): void {
  try {
    window.karrotPixel?.track(event);
  } catch {
    // 추적 실패는 무시
  }
}
