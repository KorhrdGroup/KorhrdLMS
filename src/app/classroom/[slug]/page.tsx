import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClassroomCoursePage } from "@/components/classroom/classroom-course-page";
import { getClassroomCourseLectures } from "@/features/classroom-lectures/services/classroom-lecture.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실",
  description: "한평생 직업훈련센터 학습강의실",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/classroom/${slug}`);
  }

  let course: Awaited<ReturnType<typeof getClassroomCourseLectures>> = null;
  try {
    course = await getClassroomCourseLectures(member.id, slug);
  } catch {
    course = null;
  }

  // 차시 목록 페이지를 거치지 않고 바로 플레이어로 이동합니다.
  // 이어서 볼 차시(첫 미완료 차시, 전부 완료면 1차시)로 보내며,
  // 차시가 아직 없는 과정만 기존 안내 화면을 그대로 보여줍니다.
  if (course && course.sessions.length > 0) {
    const target =
      course.sessions.find((session) => session.status !== "completed") ?? course.sessions[0];
    redirect(`/classroom/${slug}/lecture/${target.order}`);
  }

  return <ClassroomCoursePage slug={slug} course={course} />;
}
