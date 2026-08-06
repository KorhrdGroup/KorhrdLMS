import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getPracticeSet } from '@/features/classroom-exams/services/classroom-practice.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import PracticeSolver from './PracticeSolver';

export const metadata: Metadata = {
  title: '기출문제 풀이 — 한평생 직업훈련',
  robots: { index: false },
};

type PageProps = { params: Promise<{ course: string; practiceId: string }> };

/** 기출문제 풀이 — 정답은 여기서만 내려갑니다(실제 시험은 절대 내려보내지 않습니다). */
export default async function Page({ params }: PageProps) {
  const { course, practiceId } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/exam/${course}/practice/${practiceId}`);
  }

  const set = await getPracticeSet(member.id, course, practiceId);

  if (!set) {
    return (
      <div className="container">
        <div className="page-head"><h1>기출문제 풀이</h1></div>
        <div className="guide-box">
          <strong>기출문제를 열 수 없습니다</strong>
          <ul><li>수강 중인 과정의 기출문제만 풀 수 있습니다.</li></ul>
        </div>
        <p className="rv-cta">
          <Link className="btn btn--primary" href={`/exam/${course}`}>시험 목록으로</Link>
        </p>
      </div>
    );
  }

  return <PracticeSolver set={set} />;
}
