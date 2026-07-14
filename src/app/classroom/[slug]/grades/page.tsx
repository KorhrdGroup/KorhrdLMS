import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClassroomGradesPage } from "@/components/classroom/classroom-grades-page";
import { getClassroomCourseGrade } from "@/features/classroom-grades/services/classroom-grade.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실 성적",
  description: "한평생 직업훈련센터 학습강의실 성적보기",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/classroom/${slug}/grades`);
  }

  const data = await getClassroomCourseGrade(member.id, slug);

  return <ClassroomGradesPage slug={slug} data={data} />;
}
