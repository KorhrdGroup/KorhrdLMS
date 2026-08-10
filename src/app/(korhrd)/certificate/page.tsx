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
  // 확정 디자인의 딥링크는 certificate.html?course=<과목명> 입니다.
  // 나의 강의실·시험성적 화면에서는 과정 UUID를 들고 있지 않아 과목명으로 넘어옵니다.
  const courseTitle = Array.isArray(params.course) ? params.course[0] : params.course;

  const member = await getMockableStudentMember();
  if (!member) {
    redirect('/login?redirect=/certificate');
  }

  const data = await getCertificateApplicationPageData(member.id);
  if (!data) {
    redirect('/mylecture');
  }

  return <CertificateApplyForm data={data} initialCourseId={courseId} initialCourseTitle={courseTitle} />;
}
