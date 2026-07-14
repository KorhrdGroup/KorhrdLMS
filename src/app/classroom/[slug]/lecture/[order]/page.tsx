import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LecturePlayerPage } from "@/components/classroom/lecture-player-page";
import { getClassroomLectureDetail } from "@/features/classroom-lectures/services/classroom-lecture.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실",
  description: "한평생 직업훈련센터 학습강의실",
};

type PageProps = {
  params: Promise<{ slug: string; order: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug, order } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/classroom/${slug}/lecture/${order}`);
  }

  let detail: Awaited<ReturnType<typeof getClassroomLectureDetail>> = null;
  try {
    detail = await getClassroomLectureDetail(member.id, slug, Number(order));
  } catch {
    detail = null;
  }

  return <LecturePlayerPage slug={slug} detail={detail} />;
}
