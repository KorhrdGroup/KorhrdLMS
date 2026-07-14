import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClassroomNoticeDetailPage } from "@/components/classroom/classroom-notice-detail-page";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실 공지사항",
  description: "한평생 직업훈련센터 학습강의실 공지사항",
};

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug, id } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/classroom/${slug}/notices/${id}`);
  }

  return <ClassroomNoticeDetailPage slug={slug} id={id} />;
}
