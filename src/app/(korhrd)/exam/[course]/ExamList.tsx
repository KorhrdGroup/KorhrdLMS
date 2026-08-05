'use client';

import Link from 'next/link';

import type { ClassroomExamList } from '@/features/classroom-exams/types/classroom-exam.types';

const STATUS_BADGE: Record<string, { tone: string; label: string }> = {
  locked: { tone: 'expired', label: '응시 불가' },
  upcoming: { tone: 'info', label: '기간 전' },
  available: { tone: 'pass', label: '응시 가능' },
  submitted: { tone: 'done', label: '제출 완료' },
  closed: { tone: 'expired', label: '기간 종료' },
};

/** 과정별 시험 목록 — 마크업은 korhrd 디자인, 응시 자격 판단은 기존 시험 서비스. */
export function ExamList({ data }: { data: ClassroomExamList }) {
  return (
    <div className="container">
      <section className="exam">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><Link href="/">홈</Link></li>
            <li><Link href="/mylecture">나의 강의실</Link></li>
            <li aria-current="page">시험</li>
          </ol>
        </nav>

        <div className="exam__head">
          <h1>{data.courseTitle} · 시험</h1>
        </div>

        <dl className="exam-info">
          <div><dt>응시기간</dt><dd>{data.enrollmentStartDate} ~ {data.enrollmentEndDate}</dd></div>
          <div><dt>진도율</dt><dd>{Math.round(data.progressRate)}%</dd></div>
          <div><dt>응시 조건</dt><dd>진도율 {data.eligibilityThreshold}% 이상</dd></div>
        </dl>

        {!data.eligible ? (
          <div className="guide-box">
            <strong>아직 응시할 수 없습니다</strong>
            <ul>
              <li>진도율 {data.eligibilityThreshold}% 이상을 채우면 응시 버튼이 열립니다.</li>
              <li>현재 진도율은 {Math.round(data.progressRate)}%입니다.</li>
            </ul>
          </div>
        ) : null}

        {data.exams.length === 0 ? (
          <div className="guide-box">
            <strong>등록된 시험이 없습니다</strong>
            <ul><li>시험이 등록되면 이 화면에서 응시하실 수 있습니다.</li></ul>
          </div>
        ) : null}

        {data.exams.map((exam) => {
          const badge = STATUS_BADGE[exam.status] ?? STATUS_BADGE.locked;
          return (
            <article className="my-card" key={exam.id}>
              <div>
                <div className="my-card__head">
                  <h2>{exam.title}</h2>
                  <span className={`badge badge--${badge.tone}`}>{badge.label}</span>
                </div>
                <p className="my-card__date">
                  {exam.questionCount}문항 · {exam.durationMinutes}분
                  {exam.passScore !== null ? ` · 합격 ${exam.passScore}점` : ''}
                </p>
                {exam.status === 'submitted' && exam.score !== null ? (
                  <p className={`my-card__status my-card__status--${exam.isPassed ? 'pass' : 'fail'}`}>
                    {exam.score}점 / {exam.totalScore}점 · {exam.isPassed ? '합격' : '불합격'}
                  </p>
                ) : null}
              </div>

              <div className="my-card__actions">
                {exam.status === 'available' ? (
                  <Link
                    className="btn btn--primary btn--block"
                    href={`/exam/${data.courseCode}/${exam.id}`}
                  >
                    시험 응시하기
                  </Link>
                ) : exam.status === 'submitted' ? (
                  <Link
                    className="btn btn--ghost btn--block"
                    href={`/exam/${data.courseCode}/${exam.id}`}
                  >
                    결과 보기
                  </Link>
                ) : (
                  <span className="btn btn--block" aria-disabled="true">시험 응시하기</span>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
