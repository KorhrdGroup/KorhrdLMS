import Footer from "@/features/korhrd/components/layout/Footer";
import Header from "@/features/korhrd/components/layout/Header";
import TabBar from "@/features/korhrd/components/layout/TabBar";
import { BodyAuthFlag } from "@/features/korhrd/components/layout/BodyAuthFlag";
import { KorhrdAuthProvider } from "@/features/korhrd/lib/auth-context";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * korhrd 디자인(전달본 handoff/)을 쓰는 학생 화면의 껍데기.
 *
 * 과정 상세페이지와 같은 방식입니다 — 퍼블리싱 CSS를 Tailwind 전역에 섞지 않고
 * `public/korhrd/css/*.css` 를 이 레이아웃에서만 <link>로 답니다. 순서가 곧 규칙이라
 * (전달본 CLAUDE.md 1절) 아래 링크 순서를 바꾸면 화면이 깨집니다.
 *
 * 폰트도 상세페이지와 동일하게 래퍼에서 Pretendard 스택을 강제합니다.
 * (root layout의 Tailwind .font-sans(Noto Sans)가 body에 걸려 있어 덮어야 합니다)
 */
const CSS_ORDER = [
  "tokens", "base", "layout", "ui", "home", "course", "review",
  "detail", "account", "responsive", "classroom", "job", "appendix",
] as const;

const FONT_STACK =
  '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, ' +
  '"Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif';

export default async function KorhrdLayout({ children }: { children: React.ReactNode }) {
  // 학생 세션은 httpOnly 쿠키라 서버에서 읽어 Context로 내려줍니다.
  // (Supabase Auth가 아닙니다 — 헤더가 로그인 상태를 못 알아보던 원인)
  const member = await getMockableStudentMember();
  const auth = {
    isLoggedIn: member !== null,
    userName: member?.name ?? "회원",
  };

  return (
    <div style={{ fontFamily: FONT_STACK }}>
      {CSS_ORDER.map((name) => (
        // eslint-disable-next-line @next/next/no-css-tags
        <link key={name} rel="stylesheet" href={`/korhrd/css/${name}.css`} />
      ))}
      <a className="skip-link" href="#main">본문 바로가기</a>
      <KorhrdAuthProvider value={auth}>
        <BodyAuthFlag isLoggedIn={auth.isLoggedIn} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <TabBar />
      </KorhrdAuthProvider>
    </div>
  );
}
