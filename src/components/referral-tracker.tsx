"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import {
  formatReferralSource,
  formatReferrerFallback,
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE,
} from "@/lib/shared/referral-source";

/**
 * 마케팅 링크로 들어온 첫 방문을 쿠키에 기록합니다 (루트 레이아웃에 상주).
 * 첫 유입을 남기는 목적이라 이미 쿠키가 있으면 덮어쓰지 않습니다.
 * 회원가입 서버 액션이 이 쿠키를 읽어 members.referral_source 로 저장합니다.
 */
export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // utm 파라미터가 최우선, 없으면 리퍼러(어느 사이트에서 넘어왔는지)로 추정
    const source =
      formatReferralSource(new URLSearchParams(searchParams)) ??
      formatReferrerFallback(document.referrer);
    if (!source) return;
    if (document.cookie.split("; ").some((c) => c.startsWith(`${REFERRAL_COOKIE}=`))) return;

    document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(source)}; path=/; max-age=${REFERRAL_COOKIE_MAX_AGE}; samesite=lax`;
  }, [searchParams]);

  return null;
}
