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
    /* 링크에 직접 붙인 꼬리표(?from=·utm)는 언제나 최신 값으로 덮어씁니다 —
       "여주맘" 처럼 구체적인 값이 이전에 추정해 둔 "네이버카페" 에 가려지면 안 됩니다.
       리퍼러 추정값은 그보다 약한 정보라, 쿠키가 비어 있을 때만 채웁니다. */
    const explicit = formatReferralSource(new URLSearchParams(searchParams));
    const hasCookie = document.cookie
      .split("; ")
      .some((c) => c.startsWith(`${REFERRAL_COOKIE}=`));

    const source = explicit ?? (hasCookie ? null : formatReferrerFallback(document.referrer));
    if (!source || (!explicit && hasCookie)) return;

    document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(source)}; path=/; max-age=${REFERRAL_COOKIE_MAX_AGE}; samesite=lax`;
  }, [searchParams]);

  return null;
}
