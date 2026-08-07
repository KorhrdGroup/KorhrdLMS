'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { PracticeSet } from '@/features/classroom-exams/services/classroom-practice.service';
import {
  formatAnswerKey,
  isAnswerChoice,
  isCorrectAnswer,
  isMultipleAnswer,
  parseAnswerKey,
} from '@/features/exams/lib/answer-key';

/**
 * 기출문제 풀이.
 * 시험 응시 화면(ExamTaking)과 **같은 클래스**를 씁니다 — 학생이 같은 화면으로
 * 연습하도록 하기 위해서입니다(.exam / .q-card / .q-options / .q-option).
 *
 * 다른 점은 두 가지입니다.
 *  · 제출·채점이 없습니다(성적에 반영되지 않습니다). 그래서 타이머도 없습니다.
 *  · 문항마다 "정답 보기"가 있어 눌러서 정답과 내 선택의 정오를 바로 확인합니다.
 *
 * 복수정답 문항(정답이 "2,4" 처럼 들어 있는 문항)은 라디오 대신 체크박스로 받습니다.
 * 원본 정답표에 복수정답 칸이 있는 과정이 있어서입니다(자기주도학습지도사 등).
 * 채점은 부분점수 없이 정답 집합이 정확히 같을 때만 맞힌 것으로 봅니다.
 */
export default function PracticeSolver({ set }: { set: PracticeSet }) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const revealAll = () => {
    setRevealed(Object.fromEntries(set.questions.map((q) => [q.id, true])));
  };
  const reset = () => {
    setPicked({});
    setRevealed({});
  };

  const answeredCount = Object.keys(picked).length;
  const revealedCount = Object.values(revealed).filter(Boolean).length;
  const gradedCount = set.questions.filter(
    (q) => revealed[q.id] && isCorrectAnswer(q.answer, picked[q.id]),
  ).length;

  /** 복수정답 문항에서 보기 하나를 켜고 끕니다 */
  const toggleChoice = (questionId: string, choiceId: string) => {
    setPicked((prev) => {
      const current = parseAnswerKey(prev[questionId] ?? '');
      const next = current.includes(choiceId)
        ? current.filter((v) => v !== choiceId)
        : [...current, choiceId].sort();
      const value = next.join(',');
      if (!value) {
        // 다 끄면 "푼 문항" 수에서도 빠져야 해서 키 자체를 지웁니다
        return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== questionId));
      }
      return { ...prev, [questionId]: value };
    });
  };

  return (
    <div className="container">
      <section className="exam">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><Link href="/">홈</Link></li>
            <li><Link href="/mylecture">나의 강의실</Link></li>
            {/* 기출문제는 시험 목록이 아니라 강의실(학습자료)에서 들어옵니다.
                왔던 길로 돌아가도록 시험 대신 강의실을 겁니다. */}
            <li><Link href={`/lecture/${set.courseCode}`}>강의실</Link></li>
            <li aria-current="page">기출문제 풀이</li>
          </ol>
        </nav>

        <div className="exam__head"><h1>{set.title}</h1></div>

        <dl className="exam-info">
          <div><dt>과정</dt><dd>{set.courseTitle}</dd></div>
          <div><dt>문항수</dt><dd>{set.questions.length}문항</dd></div>
          <div><dt>유형</dt><dd>연습용</dd></div>
        </dl>

        {/* 연습이라 제한시간이 없습니다. 대신 푼 문항·맞힌 문항을 보여줍니다 */}
        <div className="exam-status">
          <p className="exam-status__count">
            푼 문항 <b>{answeredCount}</b> / <span>{set.questions.length}</span>
          </p>
          <p className="exam-status__count">
            맞힌 문항 <b>{gradedCount}</b> / <span>{revealedCount}</span>
          </p>
        </div>

        <p className="exam-submit__note" style={{ marginBottom: 16 }}>
          기출문제는 성적에 반영되지 않습니다. 문항마다 <b>정답 보기</b>로 바로 확인하세요.
        </p>

        <div className="q-list">
          {set.questions.map((question) => {
            const mine = picked[question.id];
            const open = revealed[question.id];
            const correct = isCorrectAnswer(question.answer, mine);
            const multiple = isMultipleAnswer(question.answer);
            const mineChoices = parseAnswerKey(mine ?? '');

            return (
              /* 시험 화면과 같게 — 답을 고른 문항은 번호 배지·테두리가 파랗게 바뀝니다 */
              <fieldset className={`q-card${mine ? ' is-answered' : ''}`} key={question.id}>
                <legend className="q-card__q">
                  <span className="q-card__num">{question.order}</span>
                  <span style={{ whiteSpace: 'pre-line' }}>{question.question}</span>
                </legend>

                {multiple ? (
                  <p className="exam-submit__note" style={{ marginBottom: 8 }}>
                    정답이 여러 개인 문항입니다 — 해당하는 보기를 모두 고르세요.
                  </p>
                ) : null}

                <div className="q-options is-single">
                  {question.choices.map((choice) => {
                    /* 정답을 열면 정답은 초록, 내가 고른 오답은 빨강으로 표시합니다 */
                    const tone = !open
                      ? undefined
                      : isAnswerChoice(question.answer, choice.id)
                        ? 'var(--green)'
                        : mineChoices.includes(choice.id)
                          ? 'var(--red)'
                          : undefined;

                    return (
                      <label className="q-option" key={choice.id} style={tone ? { color: tone } : undefined}>
                        <input
                          type={multiple ? 'checkbox' : 'radio'}
                          name={question.id}
                          value={choice.id}
                          checked={mineChoices.includes(choice.id)}
                          onChange={() =>
                            multiple
                              ? toggleChoice(question.id, choice.id)
                              : setPicked((prev) => ({ ...prev, [question.id]: choice.id }))
                          }
                        />
                        <span className="radio" aria-hidden="true" />
                        <span>{choice.text}</span>
                        {open && isAnswerChoice(question.answer, choice.id) ? <b> (정답)</b> : null}
                      </label>
                    );
                  })}
                </div>

                <p className="exam-submit" style={{ marginTop: 12 }}>
                  {open ? (
                    <span
                      className={`my-card__status my-card__status--${correct ? 'pass' : 'fail'}`}
                    >
                      {mine
                        ? correct
                          ? '정답입니다.'
                          : `오답입니다. 정답은 ${formatAnswerKey(question.answer)}번입니다.`
                        : `정답은 ${formatAnswerKey(question.answer)}번입니다.`}
                    </span>
                  ) : (
                    <button
                      className="btn btn--ghost"
                      type="button"
                      onClick={() => setRevealed((prev) => ({ ...prev, [question.id]: true }))}
                    >
                      정답 보기
                    </button>
                  )}
                </p>
              </fieldset>
            );
          })}

          <div className="exam-submit">
            <p className="exam-submit__note">
              기출문제는 연습용입니다. 성적에 반영되지 않으니 여러 번 풀어보셔도 됩니다.
            </p>
            <p className="rv-cta" style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--ghost btn--lg" type="button" onClick={reset}>
                다시 풀기
              </button>
              <button className="btn btn--primary btn--lg" type="button" onClick={revealAll}>
                정답 모두 보기
              </button>
            </p>
            {/* 다 풀고 나서 나갈 곳 — 들어온 곳(강의실)으로 돌려보냅니다 */}
            <p className="rv-cta" style={{ marginTop: 12 }}>
              <Link className="btn btn--ghost btn--block" href={`/lecture/${set.courseCode}`}>
                ← 강의실로 돌아가기
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
