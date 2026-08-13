import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getClassroomExamTaking } from '@/features/classroom-exams/services/classroom-exam.service';
import type { ClassroomExamTaking as ClassroomExamTakingData } from '@/features/classroom-exams/types/classroom-exam.types';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { ExamTaking } from './ExamTaking';

export const metadata: Metadata = { title: '시험 응시 — 한평생 직업훈련' };

type PageProps = {
  params: Promise<{ course: string; examId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// [임시 미리보기] ?preview=fail 전용 표본 시험 — 불합격 후 재응시 화면(하단의
// 지난 성적 표시)을 실제 응시 기록 없이 확인하기 위한 것입니다.
const PREVIEW_FAIL_EXAM = (course: string, examId: string): ClassroomExamTakingData => ({
  examId,
  courseCode: course,
  courseTitle: '보험심사관리사',
  periodLabel: '2026-08-12 ~ 2026-10-02',
  title: '보험심사관리사 수료시험',
  examKind: 'final_exam',
  durationMinutes: 60,
  passScore: 60,
  totalScore: 100,
  questions: [
    {
      id: 'preview-1', order: 1, questionType: 'multiple_choice',
      question: '보험심사의 기본 목적으로 가장 알맞은 것은?',
      choices: [
        { id: '1', text: '보험금 지급의 적정성 확보' },
        { id: '2', text: '보험료 인상' },
        { id: '3', text: '계약 해지 촉진' },
        { id: '4', text: '영업 실적 관리' },
      ],
      score: 34,
    },
    {
      id: 'preview-2', order: 2, questionType: 'ox',
      question: '보험심사관리사는 청구 서류의 진위 여부를 확인할 수 있다.',
      choices: [
        { id: '1', text: 'O' },
        { id: '2', text: 'X' },
      ],
      score: 33,
    },
    {
      id: 'preview-3', order: 3, questionType: 'multiple_choice',
      question: '심사 결과 통보 시 우선적으로 지켜야 할 것은?',
      choices: [
        { id: '1', text: '처리 기한 준수' },
        { id: '2', text: '구두 통보 우선' },
        { id: '3', text: '지급 보류 원칙' },
        { id: '4', text: '별도 기준 없음' },
      ],
      score: 33,
    },
  ],
  submittedResult: null,
});

export default async function Page({ params, searchParams }: PageProps) {
  const { course, examId } = await params;
  const member = await getMockableStudentMember();
  if (!member) {
    redirect(`/login?redirect=/exam/${course}/${examId}`);
  }

  // [임시 미리보기] 디자인 확인용 — 파라미터 없이 열면 실제 데이터 그대로입니다.
  const sp = await searchParams;
  const preview = Array.isArray(sp.preview) ? sp.preview[0] : sp.preview;
  if (preview === 'fail') {
    return <ExamTaking exam={PREVIEW_FAIL_EXAM(course, examId)} />;
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

  // 이미 제출한 시험이면 간이 결과 대신 성적 확인 화면으로 보냅니다.
  // (재응시가 허용된 기록은 submittedResult가 비어 있어 다시 응시 화면이 열립니다)
  if (result.exam.submittedResult) {
    redirect(`/exam/${course}/result`);
  }

  return <ExamTaking exam={result.exam} />;
}
