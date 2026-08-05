import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getClassroomExamTaking } from '@/features/classroom-exams/services/classroom-exam.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { ExamTaking } from './ExamTaking';

export const metadata: Metadata = { title: '시험 응시 — 한평생 직업훈련' };

type PageProps = { params: Promise<{ course: string; examId: string }> };

export default async function Page({ params }: PageProps) {
  const { course, examId } = await params;
  const member = await getMockableStudentMember();
  if (!member) {
    redirect(`/login?redirect=/exam/${course}/${examId}`);
  }

  const result = await getClassroomExamTaking(member.id, course, examId);
  if (!result.success) {
    return (
      <div className="container">
        <div className="page-head"><h1>시험 응시</h1></div>
        <div className="guide-box">
          <strong>시험을 열 수 없습니다</strong>
          <ul><li>{result.message}</li></ul>
        </div>
        <p className="rv-cta"><a className="btn btn--primary" href={`/exam/${course}`}>시험 목록으로</a></p>
      </div>
    );
  }

  return <ExamTaking exam={result.exam} />;
}
