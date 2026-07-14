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

  return <ClassroomCoursePage slug={slug} course={course} />;
}
