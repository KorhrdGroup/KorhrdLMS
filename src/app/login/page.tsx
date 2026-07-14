import type { Metadata } from "next";

import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "로그인",
  description: "한평생직업훈련 로그인",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectParam = params.redirect;
  const redirectTo = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;

  return <LoginPage redirectTo={redirectTo} />;
}
