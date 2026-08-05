import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getClassroomCourseExams } from '@/features/classroom-exams/services/classroom-exam.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { ExamList } from './ExamList';

export const metadata: Metadata = { title: '시험 — 한평생 직업훈련' };

type PageProps = { params: Promise<{ course: string }> };

export default async function Page({ params }: PageProps) {
  const { course } = await params;
  const member = await getMockableStudentMember();
  if (!member) {
    redirect(`/login?redirect=/exam/${course}`);
  }

  const data = await getClassroomCourseExams(member.id, course);
  if (!data) {
    return (
      <div className="container">
        <div className="page-head"><h1>시험</h1></div>
        <div className="guide-box">
          <strong>시험 정보를 불러올 수 없습니다</strong>
          <ul><li>수강 승인이 완료된 과정만 응시할 수 있습니다.</li></ul>
        </div>
        <p className="rv-cta"><a className="btn btn--primary" href="/mylecture">나의 강의실로</a></p>
      </div>
    );
  }

  return <ExamList data={data} />;
}
