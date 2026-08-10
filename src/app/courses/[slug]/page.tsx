import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseDetailView } from "@/features/course-detail/components/course-detail-view";
import { getCourseDetail } from "@/features/course-detail/services/course-detail.service";
import { KorhrdAuthProvider } from "@/features/korhrd/lib/auth-context";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * slug는 과정 코드(`courses.code`, 예: CRS-KH-0038)입니다.
 * 수강신청 카탈로그(enrollment-catalog)가 같은 값으로 링크를 만듭니다.
 *
 * 어드민에서 상세페이지 내용을 고치면 즉시 반영돼야 하므로 미리 생성하지 않고
 * 요청 시점에 DB에서 읽습니다.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseDetail(slug);
  if (!course) return { title: "과정 상세" };

  return {
    title: `${course.title} — 한평생 직업훈련`,
    description: course.description.body.slice(0, 120) || undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourseDetail(slug);

  if (!course) {
    notFound();
  }

  // 학생 세션은 httpOnly 쿠키라 서버에서 읽습니다((korhrd) 레이아웃과 같은 방식)
  const member = await getMockableStudentMember();
  const auth = { isLoggedIn: member !== null, userName: member?.name ?? "회원" };

  return (
    <>
      {/* 퍼블리싱 산출물의 디자인 시스템. 이 라우트에서만 불러옵니다. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/course-detail/css/style.css" />
      {/* 전달본 뒤에 실려야 합니다 — 다른 화면과 헤더 동작을 맞추는 보정입니다 */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/course-detail/css/overrides.css" />
      {/* 공용 Header 가 로그인 상태를 Context 로 받습니다.
          (korhrd) 그룹 밖이라 여기서 직접 내려줍니다. */}
      <KorhrdAuthProvider value={auth}>
        <CourseDetailView course={course} />
      </KorhrdAuthProvider>
    </>
  );
}
