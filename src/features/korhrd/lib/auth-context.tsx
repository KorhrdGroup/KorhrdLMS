"use client";

import { createContext, useContext } from "react";

/**
 * korhrd 화면의 로그인 상태.
 *
 * 학생 세션은 Supabase Auth가 아니라 httpOnly 쿠키(STUDENT_SESSION_COOKIE)라서
 * 클라이언트에서 직접 읽을 수 없습니다. (korhrd) 레이아웃(서버)이 세션을 조회해
 * 이 Provider로 내려주고, 화면들은 전달본 계약(isLoggedIn·userName)대로 씁니다.
 */
export type KorhrdAuth = { isLoggedIn: boolean; userName: string };

const AuthContext = createContext<KorhrdAuth>({ isLoggedIn: false, userName: "회원" });

export function KorhrdAuthProvider({
  value,
  children,
}: {
  value: KorhrdAuth;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useKorhrdAuth(): KorhrdAuth {
  return useContext(AuthContext);
}
