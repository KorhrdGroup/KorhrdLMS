import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { startExamRetakeAction } from '@/features/classroom-exams/actions/classroom-exam.actions';
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
  const { progress, weights } = data;
  const passed = summary.isPassed;
  const examTaken = summary.examPercent !== null;
  const submittedExams = data.grade.exams.filter((exam) => exam.submitted);

  /* 합격 초록(전달본 기본) · 불합격 빨강 · 미응시 회색 — 배지와 메시지가 같은 색을 씁니다 */
  const verdictClass = passed ? '' : examTaken ? ' is-fail' : ' is-none';

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

        {/* 결과 요약 */}
        <div className="result-summary">
          <div className="result-summary__left">
            {/* 합격 초록(전달본 기본) · 불합격 빨강(전달본 is-fail) ·
                미응시 회색(is-none). 미응시는 나쁜 결과가 아니라 아직 아무것도
                하지 않은 상태라 빨강으로 겁줄 이유가 없습니다.
                (원본 main.js 는 합격/불합격 둘로만 나눠 미응시도 빨강이었습니다) */}
            <span className={`result-summary__badge${verdictClass}`}>
              {passed ? '✓ 합격' : examTaken ? '불합격' : '미응시'}
            </span>
            <span className="result-summary__course">
              {data.courseTitle}
              <small>수강기간 {summary.periodLabel}</small>
            </span>
          </div>
          <dl className="result-summary__stats">
            <div className="result-summary__stat"><dt>점수</dt><dd>{summary.totalScore}</dd></div>
            <div className="result-summary__stat"><dt>등급</dt><dd>{summary.grade}</dd></div>
            <div className="result-summary__stat"><dt>진도율</dt><dd>{summary.progressRate}%</dd></div>
          </dl>
        </div>

        {/* 성적보기 */}
        <div className="result-section">
          <div className="result-section__head"><h2>성적보기</h2></div>
          <div className="table-scroll">
            <table className="result-table">
              <thead>
                <tr>
                  <th>수강기간</th><th>과목명</th><th>촬영교수</th><th>결제</th>
                  <th>시험</th><th>진도율</th><th>점수</th><th>등급</th><th>합격여부</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{summary.periodLabel}</td>
                  <td>{summary.subjectName}</td>
                  <td>{data.professorName || '—'}</td>
                  <td>{summary.paymentStatusLabel}</td>
                  <td>{data.grade.exams.filter((e) => e.submitted).length}/{data.grade.exams.length}</td>
                  <td>{summary.progressRate}%</td>
                  <td className="is-highlight">{summary.totalScore}</td>
                  <td className="is-grade">{summary.grade}</td>
                  <td className={passed ? 'is-pass' : ''}>{passed ? '합격' : examTaken ? '불합격' : '미응시'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 학습진도 */}
        <div className="result-section">
          <div className="result-section__head"><h2>학습진도</h2></div>
          <div className="progress-rows">
            <div className="progress-row progress-row--current">
              <span className="progress-row__label">현재진도</span>
              <span className="progress-row__track"><i style={{ width: `${progress.percent}%` }} /></span>
              <span className="progress-row__pct">{progress.percent}%</span>
              <span className="progress-row__count">
                <b>{progress.completedLectures}강</b> / {progress.totalLectures}강
              </span>
            </div>
            <div className="progress-row progress-row--recommend">
              <span className="progress-row__label">권장진도</span>
              <span className="progress-row__track"><i style={{ width: `${progress.recommendedPercent}%` }} /></span>
              <span className="progress-row__pct">{progress.recommendedPercent}%</span>
              <span className="progress-row__count">
                <b>{progress.recommendedLectures}강</b> / {progress.totalLectures}강
              </span>
            </div>
          </div>
        </div>

        {/* 시험 */}
        <div className="result-section">
          <div className="result-section__head"><h2>시험</h2></div>
          <div className="table-scroll">
            <table className="result-table">
              <thead>
                <tr><th>시험명</th><th>시험 기간</th><th>백분율 점수</th><th>전체성적 반영비율</th></tr>
              </thead>
              <tbody>
                {data.grade.exams.length === 0 ? (
                  <tr><td colSpan={4}>등록된 시험이 없습니다.</td></tr>
                ) : (
                  data.grade.exams.map((exam) => (
                    <tr key={exam.id}>
                      <td>{exam.title}</td>
                      <td>{exam.periodLabel}</td>
                      <td className="is-highlight">{exam.scorePercentLabel}</td>
                      <td>{weights.exam}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 학습평가 */}
        <div className="result-section">
          <div className="result-section__head"><h2>학습평가</h2></div>
          <div className="table-scroll">
            <table className="result-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="row-label">평가요소</th>
                  <th>출석</th><th>수료시험</th><th>계</th><th>점수</th><th>등급</th>
                </tr>
                <tr>
                  <th>{weights.attendance}%</th><th>{weights.exam}%</th><th>100%</th>
                  <th>{weights.passScore}점</th><th>D</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="row-label">현재성적 (%)</th>
                  <td>{summary.attendanceScore}</td>
                  <td className="is-highlight">{summary.examScore}</td>
                  <td>{summary.totalScore}</td>
                  <td>{summary.totalScore}점</td>
                  <td className="is-grade">{summary.grade}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 합격·불합격 메시지 — 배지와 같은 색을 씁니다
            (원본 main.js 도 msg.classList.toggle('is-fail', ...) 로 함께 바꿉니다) */}
        <div className={`result-msg${verdictClass}`}>
          {passed ? (
            <>
              <strong>{data.memberName} 학우님은 {data.courseTitle} 시험에 합격하셨습니다.</strong>
              <p>출석 {summary.attendanceScore}점 + 시험 {summary.examScore}점 = 총점 {summary.totalScore}점으로 합격 기준({weights.passScore}점)을 넘어 자격증 발급 신청이 가능합니다.</p>
            </>
          ) : examTaken ? (
            <>
              <strong>{data.memberName} 학우님은 아직 합격 기준에 도달하지 않았습니다.</strong>
              <p>
                출석({weights.attendance}%) + 시험({weights.exam}%) 합산 {weights.passScore}점 이상이면 합격입니다.
                (현재 출석 {summary.attendanceScore}점 + 시험 {summary.examScore}점 = {summary.totalScore}점)
              </p>
            </>
          ) : (
            <>
              <strong>아직 응시한 시험이 없습니다.</strong>
              <p>진도율 {weights.passScore}% 이상부터 시험에 응시하실 수 있습니다. (현재 진도율 {summary.progressRate}%)</p>
            </>
          )}
        </div>

        {/* 버튼은 한 줄(.result-cta)에 모읍니다 — 블록을 나누면 간격 없이 붙어 보입니다.
            재응시는 제출한 시험만 나오고, 다시 제출하면 이 점수를 덮어씁니다. */}
        <div className="result-cta">
          <Link className="btn btn--ghost btn--lg" href="/mylecture">이전으로</Link>
          {submittedExams.map((exam) => (
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
