import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClassroomCertificatePage } from "@/components/classroom/classroom-certificate-page";
import { getClassroomCertificateStatus } from "@/features/classroom-certificates/services/classroom-certificate.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실 수료증",
  description: "한평생 직업훈련센터 학습강의실 수료증",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/classroom/${slug}/certificate`);
  }

  const status = await getClassroomCertificateStatus(member.id, slug, member.name);

  return <ClassroomCertificatePage slug={slug} status={status} />;
}
