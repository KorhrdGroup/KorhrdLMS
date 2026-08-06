import Footer from "@/features/korhrd/components/layout/Footer";
import Header from "@/features/korhrd/components/layout/Header";
import TabBar from "@/features/korhrd/components/layout/TabBar";
import { BodyAuthFlag } from "@/features/korhrd/components/layout/BodyAuthFlag";
import {
  KORHRD_FONT_STACK,
  KorhrdStyleLinks,
} from "@/features/korhrd/components/layout/KorhrdShell";
import { KorhrdAuthProvider } from "@/features/korhrd/lib/auth-context";
import { CourseThumbProvider } from "@/features/korhrd/lib/course-thumb-context";
import { getCourseThumbnailMap } from "@/features/korhrd/lib/course-thumbnails";
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
// CSS 순서(KORHRD_CSS_ORDER)와 폰트 스택은 KorhrdShell에서 한 곳으로 모았습니다 —
// 라우트 그룹 밖의 404(app/not-found.tsx)도 같은 껍데기를 써야 하기 때문입니다.
const FONT_STACK = KORHRD_FONT_STACK;

export default async function KorhrdLayout({ children }: { children: React.ReactNode }) {
  // 학생 세션은 httpOnly 쿠키라 서버에서 읽어 Context로 내려줍니다.
  // (Supabase Auth가 아닙니다 — 헤더가 로그인 상태를 못 알아보던 원인)
  // 과정 썸네일은 어드민에서 바꾸면 바로 반영돼야 해서 스냅샷 대신 DB 값을 씁니다.
  const [member, courseThumbs] = await Promise.all([
    getMockableStudentMember(),
    getCourseThumbnailMap(),
  ]);
  const auth = {
    isLoggedIn: member !== null,
    userName: member?.name ?? "회원",
  };

  return (
    <div style={{ fontFamily: FONT_STACK }}>
      <KorhrdStyleLinks />
      <a className="skip-link" href="#main">본문 바로가기</a>
      <KorhrdAuthProvider value={auth}>
        <CourseThumbProvider value={courseThumbs}>
          <BodyAuthFlag isLoggedIn={auth.isLoggedIn} />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <TabBar />
        </CourseThumbProvider>
      </KorhrdAuthProvider>
    </div>
  );
}
