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

/**
 * 과정별 시험 목록 — 마크업은 korhrd 디자인, 응시 자격 판단은 기존 시험 서비스.
 *
 * 기출문제(연습용)는 여기에 두지 않습니다. 채점 대상 시험과 헷갈리기 쉬워
 * 강의실 화면(학습자료 > 기출문제)에서만 풀도록 모았습니다.
 */
export function ExamList({ data }: { data: ClassroomExamList }) {
  // 시안(exam.html)은 시험 1개 기준이라 제목이 "과정 시험 · 시험명", 정보가
  // 시험명·응시기간·문항수·시험시간 4칸입니다. 우리도 과정당 시험이 하나뿐이라
  // 그 형태를 그대로 쓰고, 시험이 없거나 둘 이상인 예외에서만 기존 3칸으로 돌아갑니다.
  const only = data.exams.length === 1 ? data.exams[0] : null;
  const period = `${data.enrollmentStartDate} ~ ${data.enrollmentEndDate}`;

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
          {/* 시험이 하나면 그 시험 이름만 씁니다. 이름 자체가 '{과정명} 수료시험'
              이라, 앞에 과정명을 한 번 더 붙이면 같은 말이 두 번 나옵니다
              (2026-08-11, 디자인 요청). */}
          <h1>{only ? only.title : `${data.courseTitle} · 시험`}</h1>
        </div>

        {only ? (
          <dl className="exam-info">
            <div><dt>시험명</dt><dd>{only.title}</dd></div>
            <div><dt>응시기간</dt><dd>{period}</dd></div>
            <div><dt>문항수</dt><dd>{only.questionCount}문항</dd></div>
            <div><dt>시험시간</dt><dd>{only.durationMinutes}분</dd></div>
          </dl>
        ) : (
          <dl className="exam-info">
            <div><dt>응시기간</dt><dd>{period}</dd></div>
            <div><dt>진도율</dt><dd>{Math.round(data.progressRate)}%</dd></div>
            <div><dt>응시 조건</dt><dd>진도율 {data.eligibilityThreshold}% 이상</dd></div>
          </dl>
        )}

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
          /* 불합격 후 재응시 — 응시 가능한데 지난 응시 기록이 있는 경우입니다.
             합격이면 성적은 성적 확인 화면에서 보지만, 불합격은 이 화면에서
             지난 점수를 보여주고 바로 다시 응시하게 합니다. */
          const retaking = exam.status === 'available' && exam.score !== null;
          const badge = retaking
            ? { tone: 'pass', label: '재응시 가능' }
            : STATUS_BADGE[exam.status] ?? STATUS_BADGE.locked;
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
                {exam.score !== null && (exam.status === 'submitted' || retaking) ? (
                  <p className={`my-card__status my-card__status--${exam.isPassed ? 'pass' : 'fail'}`}>
                    {retaking
                      ? `지난 응시 ${exam.score}점 / ${exam.totalScore}점 · 불합격`
                      : `${exam.score}점 / ${exam.totalScore}점 · ${exam.isPassed ? '합격' : '불합격'}`}
                  </p>
                ) : null}
              </div>

              <div className="my-card__actions">
                {exam.status === 'available' ? (
                  <Link
                    className="btn btn--primary btn--block"
                    href={`/exam/${data.courseCode}/${exam.id}`}
                  >
                    {retaking ? '재응시하기' : '시험 응시하기'}
                  </Link>
                ) : exam.status === 'submitted' ? (
                  /* 제출한 시험은 점수만 있는 간이 화면 대신 성적 확인으로 보냅니다 */
                  <Link
                    className="btn btn--ghost btn--block"
                    href={`/exam/${data.courseCode}/result`}
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
