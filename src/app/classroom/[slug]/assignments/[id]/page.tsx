import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClassroomAssignmentDetailPage } from "@/components/classroom/classroom-assignment-detail-page";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실 과제",
  description: "한평생 직업훈련센터 학습강의실 과제",
};

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug, id } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/classroom/${slug}/assignments/${id}`);
  }

  return <ClassroomAssignmentDetailPage slug={slug} id={id} />;
}
