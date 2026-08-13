import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getClassroomCourseExams } from '@/features/classroom-exams/services/classroom-exam.service';
import { getClassroomExamResult } from '@/features/classroom-grades/services/classroom-exam-result.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { ExamList } from './ExamList';

export const metadata: Metadata = { title: '시험 — 한평생 직업훈련' };

type PageProps = {
  params: Promise<{ course: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { course } = await params;
  const member = await getMockableStudentMember();
  if (!member) {
    redirect(`/login?redirect=/exam/${course}`);
  }

  const data = await getClassroomCourseExams(member.id, course);

  // 불합격 후 재응시로 이 화면에 온 경우 — 성적 확인 본문을 카드 아래에 붙이기
  // 위해 성적 데이터를 함께 읽습니다. (합격은 기존대로 성적 확인 화면에서 봅니다)
  const hasFailedAttempt = Boolean(
    data?.exams.some(
      (exam) => exam.status === 'available' && exam.score !== null && exam.isPassed === false,
    ),
  );
  const failResult = hasFailedAttempt
    ? await getClassroomExamResult(member.id, member.name, course)
    : null;

  // [임시 미리보기] ?preview=fail 로 열면 불합격 후 재응시 상태로 바꿔 보여줍니다.
  // 디자인 확인용이며, 파라미터 없이 열면 실제 데이터 그대로입니다.
  const sp = await searchParams;
  const preview = Array.isArray(sp.preview) ? sp.preview[0] : sp.preview;
  if (data && preview === 'fail') {
    data.progressRate = Math.max(data.progressRate, 80);
    data.eligible = true;
    data.exams = data.exams.map((exam) => ({
      ...exam,
      status: 'available' as const,
      score: 52,
      totalScore: 100,
      isPassed: false,
    }));
  }
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

  return <ExamList data={data} failResult={failResult} />;
}
