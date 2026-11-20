"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { recordPageViewAction } from "@/features/korhrd/actions/page-view.actions";

const VISITOR_COOKIE = "hp_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * 화면 이동마다 page_views 에 한 줄씩 남깁니다 (루트 레이아웃에 상주, 관리자 화면 제외).
 * 같은 사람을 한 명으로 세려고 처음 방문할 때 임의 UUID 를 쿠키(hp_vid)에 넣습니다.
 * 쿠키는 여기서 만듭니다 — 서버 액션에서 쿠키를 쓰면 Next 가 현재 화면을 다시 그립니다.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  // 개발 모드 StrictMode 의 effect 두 번 실행으로 같은 화면이 두 번 기록되지 않게
  const lastSentPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || lastSentPath.current === pathname) return;
    lastSentPath.current = pathname;

    let visitorId = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${VISITOR_COOKIE}=`))
      ?.slice(VISITOR_COOKIE.length + 1);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      document.cookie = `${VISITOR_COOKIE}=${visitorId}; path=/; max-age=${VISITOR_COOKIE_MAX_AGE}; samesite=lax`;
    }

    recordPageViewAction({ path: pathname, visitorId }).catch(() => {
      // 기록 실패는 무시
    });
  }, [pathname]);

  return null;
}
