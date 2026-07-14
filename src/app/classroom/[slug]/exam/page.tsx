import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClassroomExamPage } from "@/components/classroom/classroom-exam-page";
import { getClassroomCourseExams } from "@/features/classroom-exams/services/classroom-exam.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실 시험",
  description: "한평생 직업훈련센터 학습강의실 시험",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/classroom/${slug}/exam`);
  }

  let examList: Awaited<ReturnType<typeof getClassroomCourseExams>> = null;
  try {
    examList = await getClassroomCourseExams(member.id, slug);
  } catch {
    examList = null;
  }

  return <ClassroomExamPage slug={slug} examList={examList} />;
}
