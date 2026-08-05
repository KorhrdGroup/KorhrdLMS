"use client";

import { useKorhrdAuth } from "@/features/korhrd/lib/auth-context";

/**
 * 로그인 상태 — 학생 세션 쿠키 기준.
 *
 * 세션은 httpOnly 쿠키라 클라이언트에서 못 읽으므로, (korhrd) 레이아웃(서버)이
 * 조회한 값을 Context로 받습니다. 화면들은 전달본 계약대로
 * isLoggedIn · userName 두 값만 사용합니다.
 */
export function useAuth() {
  return useKorhrdAuth();
}
