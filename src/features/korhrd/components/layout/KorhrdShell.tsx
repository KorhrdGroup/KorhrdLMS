import Footer from "@/features/korhrd/components/layout/Footer";
import Header from "@/features/korhrd/components/layout/Header";
import TabBar from "@/features/korhrd/components/layout/TabBar";
import { BodyAuthFlag } from "@/features/korhrd/components/layout/BodyAuthFlag";
import { KorhrdAuthProvider } from "@/features/korhrd/lib/auth-context";

/**
 * korhrd 학생 화면의 껍데기(CSS 링크 + 헤더/푸터).
 *
 * `(korhrd)/layout.tsx`가 쓰는 것과 같은 껍데기를, 그 라우트 그룹 **밖**에서도
 * 쓸 수 있게 떼어낸 것입니다. 매칭되지 않는 주소의 404(`app/not-found.tsx`)는
 * 라우트 그룹 레이아웃을 타지 않아 이 컴포넌트가 필요합니다.
 *
 * CSS 순서가 곧 규칙이라(전달본 CLAUDE.md 1절) CSS_ORDER를 두 곳에 복사하지 않고
 * 여기 한 곳에서만 정의합니다 — 바꾸면 화면이 깨집니다.
 */
export const KORHRD_CSS_ORDER = [
  "tokens", "base", "layout", "ui", "home", "course", "review",
  "detail", "account", "responsive", "classroom", "job", "appendix",
] as const;

export const KORHRD_FONT_STACK =
  '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, ' +
  '"Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif';

export function KorhrdStyleLinks() {
  return (
    <>
      {KORHRD_CSS_ORDER.map((name) => (
        <link key={name} rel="stylesheet" href={`/korhrd/css/${name}.css`} />
      ))}
    </>
  );
}

/**
 * 세션을 읽을 수 없는 자리(404 등)에서 쓰는 껍데기입니다.
 * 로그인 상태는 비로그인으로 두고, 헤더는 로그인/회원가입 링크를 보여줍니다.
 */
export function KorhrdShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: KORHRD_FONT_STACK }}>
      <KorhrdStyleLinks />
      <a className="skip-link" href="#main">본문 바로가기</a>
      <KorhrdAuthProvider value={{ isLoggedIn: false, userName: "회원" }}>
        <BodyAuthFlag isLoggedIn={false} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <TabBar />
      </KorhrdAuthProvider>
    </div>
  );
}
