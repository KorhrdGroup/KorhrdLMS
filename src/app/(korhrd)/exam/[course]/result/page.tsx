import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { startExamRetakeAction } from '@/features/classroom-exams/actions/classroom-exam.actions';
import { ExamResultSections } from '@/features/classroom-grades/components/exam-result-sections';
import { getClassroomExamResult } from '@/features/classroom-grades/services/classroom-exam-result.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

export const metadata: Metadata = {
  title: '시험 성적 확인 — 한평생 직업훈련',
  robots: { index: false },
};

type PageProps = { params: Promise<{ course: string }> };

/**
 * 시험 성적 확인.
 * 프로토타입 원본: korhrd-site/exam-result.html (값은 main.js의 EXAM_RESULTS 목업이었습니다)
 *
 * 목업을 걷어내고 실제 성적(진도율·시험점수·등급·합격여부)을 붙였습니다.
 * 계산은 관리자 성적관리와 같은 규칙(grade-calculator)을 쓰는 서비스에 맡기고,
 * 이 파일은 그리기만 합니다. class 이름은 퍼블리싱 CSS(classroom.css)가 걸려 있어
 * 그대로 두었습니다.
 */
export default async function Page({ params }: PageProps) {
  const { course } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/exam/${course}/result`);
  }

  const data = await getClassroomExamResult(member.id, member.name, course);

  if (!data) {
    return (
      <div className="container">
        <div className="page-head"><h1>시험 성적 확인</h1></div>
        <div className="guide-box">
          <strong>성적을 확인할 수 없습니다</strong>
          <ul><li>수강중인 과정이 아니거나 승인 대기 중인 과정입니다.</li></ul>
        </div>
        <p className="rv-cta">
          <Link className="btn btn--primary" href="/mylecture">나의 강의실로</Link>
        </p>
      </div>
    );
  }

  const { summary } = data.grade;
  const passed = summary.isPassed;
  const submittedExams = data.grade.exams.filter((exam) => exam.submitted);

  /* 합격했으면 재응시 버튼을 내놓지 않습니다 — 다시 보면 이 점수를 덮어써
     합격이 풀릴 수 있습니다 */
  const retakeExams = passed ? [] : submittedExams;

  return (
    <div className="container">
      <section className="result">

        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><Link href="/">홈</Link></li>
            <li><Link href="/mylecture">나의 강의실</Link></li>
            <li aria-current="page">시험 성적 확인</li>
          </ol>
        </nav>

        <div className="page-head">
          <h1>시험 성적 확인</h1>
        </div>

        {/* 결과 요약 · 성적보기 · 학습진도 · 시험 · 학습평가 · 판정 문구 —
            불합격 후 재응시 화면(/exam/[course])과 공유하는 본문입니다 */}
        <ExamResultSections data={data} />

        {/* 버튼은 한 줄(.result-cta)에 모읍니다 — 블록을 나누면 간격 없이 붙어 보입니다.
            재응시는 아직 합격하지 못한 경우에만 내놓습니다. 합격한 뒤에 다시 보면
            이 점수를 덮어써 합격이 풀릴 수 있어, 할 이유가 없는 버튼입니다.
            (제출한 시험만 나오고, 다시 제출하면 이 점수를 덮어씁니다) */}
        <div className="result-cta">
          <Link className="btn btn--ghost btn--lg" href="/mylecture">이전으로</Link>
          {retakeExams.map((exam) => (
            <form action={startExamRetakeAction} key={exam.id}>
              <input type="hidden" name="courseCode" value={data.courseCode} />
              <input type="hidden" name="examId" value={exam.id} />
              <button className="btn btn--ghost btn--lg" type="submit">
                {submittedExams.length > 1 ? `${exam.title} 재응시` : '재응시하기'}
              </button>
            </form>
          ))}
          {passed ? (
            <Link
              className="btn btn--primary btn--lg"
              href={`/certificate?course=${encodeURIComponent(data.courseTitle)}`}
            >
              자격증 신청 바로가기
            </Link>
          ) : (
            <Link className="btn btn--primary btn--lg" href={`/exam/${data.courseCode}`}>시험 목록으로</Link>
          )}
        </div>

      </section>
    </div>
  );
}
