import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClassroomExamDetailPage } from "@/components/classroom/classroom-exam-detail-page";
import { getClassroomExamTaking } from "@/features/classroom-exams/services/classroom-exam.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실 시험 응시",
  description: "한평생 직업훈련센터 학습강의실 시험 응시",
};

type PageProps = {
  params: Promise<{ slug: string; examId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug, examId } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/classroom/${slug}/exam/${examId}`);
  }

  const result = await getClassroomExamTaking(member.id, slug, examId);

  return <ClassroomExamDetailPage slug={slug} examId={examId} result={result} />;
}
