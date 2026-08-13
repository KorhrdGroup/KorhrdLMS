'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { submitClassroomExamAction } from '@/features/classroom-exams/actions/classroom-exam.actions';
import type { ClassroomExamTaking } from '@/features/classroom-exams/types/classroom-exam.types';

const two = (n: number) => String(n).padStart(2, '0');

/**
 * 시험 응시 — 마크업은 korhrd 디자인(exam.html), 채점은 기존 시험 서비스.
 *
 * · 남은 시간이 0이 되면 자동 제출합니다
 * · 이미 제출한 시험은 문제 대신 결과 화면을 보여줍니다
 * · 정답은 서버에서만 다룹니다 — 이 화면은 선택한 보기만 전송합니다
 */
export function ExamTaking({ exam }: { exam: ClassroomExamTaking }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remain, setRemain] = useState(exam.durationMinutes * 60);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // 제출이 끝나면 성적 확인 화면으로 넘어갑니다. 이동이 끝날 때까지 폼을 잠그는 용도입니다.
  const [submitted, setSubmitted] = useState(false);

  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  const submit = useMemo(
    () => (auto: boolean) => {
      if (isPending || submitted) return;
      if (!auto && answered < exam.questions.length) {
        if (!window.confirm(`아직 ${exam.questions.length - answered}문항이 남았습니다. 제출할까요?`)) return;
      }
      startTransition(async () => {
        const res = await submitClassroomExamAction(exam.courseCode, exam.examId, answers);
        if (res.success) {
          setSubmitted(true);
          // 채점 결과는 성적 확인 화면에서 보여줍니다(진도·등급까지 함께 나옵니다).
          router.push(`/exam/${exam.courseCode}/result`);
        } else {
          setError(res.message);
        }
      });
    },
    [answers, answered, exam, isPending, submitted, router],
  );

  /* 남은 시간 — 0이 되면 자동 제출 */
  useEffect(() => {
    if (submitted) return;
    if (remain <= 0) {
      submit(true);
      return;
    }
    const timer = setTimeout(() => setRemain((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [remain, submitted, submit]);

  return (
    <div className="container">
      <section className="exam">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><Link href="/">홈</Link></li>
            <li><Link href="/mylecture">나의 강의실</Link></li>
            <li aria-current="page">시험 응시</li>
          </ol>
        </nav>

        {/* 시안(exam.html)과 같은 제목·정보 구성입니다. 총점·합격기준은 시안대로
            하단 안내 문구로 내렸습니다. */}
        <div className="exam__head"><h1>{exam.courseTitle} 시험 · {exam.title}</h1></div>

        <dl className="exam-info">
          <div><dt>시험명</dt><dd>{exam.title}</dd></div>
          <div><dt>응시기간</dt><dd>{exam.periodLabel}</dd></div>
          <div><dt>문항수</dt><dd>{exam.questions.length}문항</dd></div>
          <div><dt>시험시간</dt><dd>{exam.durationMinutes}분</dd></div>
        </dl>

        <div className="exam-status">
          <p className="exam-status__count">
            답변한 문항 <b>{answered}</b> / <span>{exam.questions.length}</span>
          </p>
          <p className="exam-status__timer">
            남은 시간 <span className="clock">{two(Math.floor(remain / 60))}:{two(remain % 60)}</span>
          </p>
        </div>

        <form
          className="q-list"
          onSubmit={(event) => {
            event.preventDefault();
            submit(false);
          }}
        >
          {exam.questions.map((question) => (
            /* 답을 고른 문항은 번호 배지가 남색→파랑, 카드 테두리도 파랗게 바뀝니다.
               (classroom.css 의 .q-card.is-answered 규칙) 어디까지 풀었는지 한눈에 보입니다. */
            <fieldset
              className={`q-card${answers[question.id] ? ' is-answered' : ''}`}
              key={question.id}
            >
              <legend className="q-card__q">
                <span className="q-card__num">{question.order}</span>
                <span>{question.question}</span>
              </legend>
              <div className="q-options is-single">
                {question.choices.map((choice) => (
                  <label className="q-option" key={choice.id}>
                    <input
                      type="radio"
                      name={question.id}
                      value={choice.id}
                      checked={answers[question.id] === choice.id}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [question.id]: choice.id }))
                      }
                    />
                    <span className="radio" aria-hidden="true" />
                    <span>{choice.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          {error ? (
            <p className="my-card__status my-card__status--fail">{error}</p>
          ) : null}

          {/* 시안은 버튼이 먼저, 안내 문구가 아래입니다 */}
          <div className="exam-submit">
            <button
              className="btn btn--primary btn--lg" type="submit"
              disabled={isPending || submitted}
            >
              {isPending || submitted ? '제출 중…' : '시험 제출하기'}
            </button>
            <p className="exam-submit__note">
              제출 후에는 답안을 수정할 수 없습니다.
              {exam.passScore !== null
                ? ` 합격 기준은 ${exam.totalScore}점 만점에 ${exam.passScore}점 이상입니다.`
                : ''}
              {' '}남은 시간이 끝나면 자동 제출됩니다.
            </p>
            {/* 불합격 후 재응시 — 지난 점수를 참고로 보여줍니다 */}
            {exam.previousResult ? (
              <p className="my-card__status my-card__status--fail">
                지난 응시 {exam.previousResult.score}점 / {exam.previousResult.totalScore}점 · 불합격
                — 이번에 제출하는 답안으로 다시 채점됩니다.
              </p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
