import type { Metadata } from "next";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "로그인 — 한평생 직업훈련",
  description: "한평생직업훈련 로그인",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * 로그인이 필요해 넘어온 경우, 어느 화면 때문인지 알려줍니다.
 * 원본 login.html 의 .login-notice 는 "로그인이 필요한 페이지에서 넘어온 경우에만
 * 노출하세요"라는 주석과 함께 hidden 으로 놓여 있습니다 — 그 자리를 채운 것입니다.
 */
const REDIRECT_LABELS: [prefix: string, label: string][] = [
  ['/mylecture', '나의 강의실'],
  ['/lecture', '나의 강의실'],
  ['/classroom', '나의 강의실'],
  ['/certificate', '자격증 발급신청'],
  ['/exam', '시험 응시'],
  ['/mypage', '마이페이지'],
  ['/reviews/write', '합격후기 작성'],
  ['/enrollment', '수강신청'],
  ['/courses', '수강신청'],
  ['/support', '고객센터'],
];

function labelFor(path: string | undefined) {
  if (!path) return null;
  const hit = REDIRECT_LABELS.find(([prefix]) => path.startsWith(prefix));
  return hit ? hit[1] : '이 화면';
}

/** 로그인 — 마크업은 korhrd 디자인(login.html), 인증은 기존 Supabase 액션. */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const redirectParam = params.redirect;
  const redirectTo = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;
  const reason = labelFor(redirectTo);
  // 비밀번호 재설정을 마치면 /login?reset=1 로 바로 넘어옵니다.
  const passwordReset = params.reset === "1";

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="page-head text-center"><h1>로그인</h1></div>

        <LoginForm redirectTo={redirectTo} reason={reason} passwordReset={passwordReset} />
      </div>
    </div>
  );
}
