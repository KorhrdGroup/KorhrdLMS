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

/**
 * 로그인이 필요해서 넘어온 것인지 가려냅니다.
 * 목록에 없는 주소는 그냥 헤더의 로그인을 누른 것이라(공개 화면) 이름을 돌려주지
 * 않습니다 — 예전에는 '이 화면'으로 뭉뚱그려, 로그인이 필요 없는 화면에서도
 * "로그인 후 이용하실 수 있습니다" 라고 잘못 안내했습니다 (2026-08-12).
 */
function labelFor(path: string | undefined) {
  if (!path) return null;
  const clean = path.split('?')[0];
  return REDIRECT_LABELS.find(([prefix]) => clean.startsWith(prefix))?.[1] ?? null;
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
