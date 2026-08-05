import type { Metadata } from "next";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "로그인 — 한평생 직업훈련",
  description: "한평생직업훈련 로그인",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** 로그인 — 마크업은 korhrd 디자인(login.html), 인증은 기존 Supabase 액션. */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const redirectParam = params.redirect;
  const redirectTo = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="page-head text-center"><h1>로그인</h1></div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
