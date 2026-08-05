import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCertificateApplicationPageData } from '@/features/certificate-applications/services/certificate-application.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { CertificateApplyForm } from './CertificateApplyForm';

export const metadata: Metadata = { title: '자격증 발급 신청 — 한평생 직업훈련' };

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;

  const member = await getMockableStudentMember();
  if (!member) {
    redirect('/login?redirect=/certificate');
  }

  const data = await getCertificateApplicationPageData(member.id);
  if (!data) {
    redirect('/mylecture');
  }

  return <CertificateApplyForm data={data} initialCourseId={courseId} />;
}
