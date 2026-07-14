"use client";

import Link from "next/link";
import { CheckCircle2, Clock, FileCheck2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { figma, figmaClass } from "@/components/home/home-design";
import { submitClassroomExamAction } from "@/features/classroom-exams/actions/classroom-exam.actions";
import type {
  ClassroomExamSubmittedResult,
  ClassroomExamTaking,
} from "@/features/classroom-exams/types/classroom-exam.types";
import { cn } from "@/lib/utils";

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ExamTakingBoard({
  slug,
  examId,
  exam,
}: {
  slug: string;
  examId: string;
  exam: ClassroomExamTaking;
}) {
  const { questions } = exam;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(exam.durationMinutes * 60);
  const [result, setResult] = useState<ClassroomExamSubmittedResult | null>(exam.submittedResult);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (auto = false) => {
    if (submittingRef.current || result) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await submitClassroomExamAction(slug, examId, answers);

      if (!response.success) {
        setErrorMessage(response.message);
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      setResult(response.result);
      setCorrectCount(response.correctCount);
      window.alert(auto ? "응시 시간이 종료되어 자동 제출되었습니다." : "시험이 제출되었습니다.");
    } catch {
      setErrorMessage("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
      submittingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (result) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          void handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (result) {
    const passed = result.isPassed;

    return (
      <div className="min-w-0 flex-1">
        <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>{exam.title}</h2>

        <div
          className={cn(
            "flex flex-col items-center gap-4 border px-6 py-16 text-center",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
            figmaClass.whiteBg,
          )}
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-[#e5edff]">
            <FileCheck2 className="size-7" style={{ color: figma.colors.primary }} />
          </div>
          <p className={cn("text-[16px] font-bold", figmaClass.textPrimary)}>시험이 제출되었습니다.</p>

          <div className="mt-2 flex items-center gap-6">
            <div>
              <p className={cn("text-[12px]", figmaClass.textPlaceholder)}>점수</p>
              <p className="text-[28px] font-extrabold" style={{ color: figma.colors.primary }}>
                {result.score} / {result.totalScore}점
              </p>
            </div>
            {correctCount !== null ? (
              <>
                <div className="h-10 w-px bg-[#e0e0e0]" />
                <div>
                  <p className={cn("text-[12px]", figmaClass.textPlaceholder)}>정답 수</p>
                  <p className={cn("text-[20px] font-bold", figmaClass.textPrimary)}>
                    {correctCount} / {questions.length}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {passed !== null ? (
            <span
              className={cn(
                "mt-1 inline-flex rounded-full px-3 py-1 text-[12px] font-bold",
                passed ? "bg-[#e5edff] text-[#00376e]" : "border border-[#e5433f]/30 bg-[#e5433f]/5 text-[#e5433f]",
              )}
            >
              {passed ? "합격 기준 점수 충족" : "합격 기준 점수 미달"}
            </span>
          ) : null}

          <p className={cn("text-[12.5px]", figmaClass.textPlaceholder)}>
            제출 시각 {formatSubmittedAt(result.submittedAt)}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={`/classroom/${slug}/grades`}
              className="flex h-11 items-center justify-center rounded-lg px-6 text-[14px] font-bold text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: figma.colors.primary }}
            >
              성적보기로 이동
            </Link>
            <Link
              href={`/classroom/${slug}/exam`}
              className={cn(
                "flex h-11 items-center justify-center rounded-lg border px-6 text-[14px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
                figmaClass.textSub,
                figmaClass.borderDefault,
              )}
            >
              시험목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const isLowTime = remainingSeconds <= 60;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className={cn(figma.typography.sectionTitle, figmaClass.textPrimary)}>{exam.title}</h2>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold",
            isLowTime ? "bg-[#e5433f]/10 text-[#e5433f]" : "bg-[#e5edff] text-[#00376e]",
          )}
        >
          <Clock className="size-4" />
          남은 시간 {formatRemaining(remainingSeconds)}
        </span>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-lg bg-[#f7f8fa] px-4 py-3 text-[12.5px]">
        <span className={figmaClass.textMuted}>총 {questions.length}문항 · 총 {exam.totalScore}점</span>
        <span className={cn("font-semibold", figmaClass.textSub)}>
          {answeredCount} / {questions.length} 문항 응답
        </span>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{errorMessage}</div>
      ) : null}

      <div className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={cn("border p-5 sm:p-6", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}
          >
            <p className={cn("mb-4 text-[14px] font-semibold leading-relaxed", figmaClass.textPrimary)}>
              {index + 1}. {question.question}
              <span className={cn("ml-2 text-[12px] font-normal", figmaClass.textPlaceholder)}>
                ({question.score}점)
              </span>
            </p>

            {question.questionType === "short_answer" ? (
              <input
                type="text"
                value={answers[question.id] ?? ""}
                onChange={(event) =>
                  setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                }
                placeholder="답안을 입력하세요"
                className="h-11 w-full rounded-lg border border-[#e0e0e0] px-4 text-[13.5px] outline-none focus-visible:border-[#00376e]"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {question.choices.map((choice) => {
                  const checked = answers[question.id] === choice.id;
                  return (
                    <label
                      key={choice.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-[13.5px] transition-colors duration-200",
                        checked ? "border-[#00376e] bg-[#f4f8ff]" : "border-[#e0e0e0] hover:bg-[#f7f8fa]",
                        figmaClass.textBody,
                      )}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice.id}
                        checked={checked}
                        onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: choice.id }))}
                        className="size-4 accent-[#00376e]"
                      />
                      {choice.text}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            if (window.confirm("제출하시겠습니까? 제출 후에는 답안을 수정할 수 없습니다.")) {
              void handleSubmit(false);
            }
          }}
          className={cn(
            "flex h-12 items-center justify-center gap-1.5 rounded-lg px-8 text-[14.5px] font-bold text-white transition-all duration-200",
            isSubmitting ? "cursor-not-allowed opacity-60" : "hover:brightness-110",
          )}
          style={{ backgroundColor: figma.colors.primary }}
        >
          <CheckCircle2 className="size-4" />
          {isSubmitting ? "제출 중..." : "제출하기"}
        </button>
      </div>
    </div>
  );
}
