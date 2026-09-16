"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminButton, adminButtonVariants } from "@/components/admin/ui/admin-button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/admin-card";
import { formatAnswerKey, isAnswerChoice } from "@/features/exams/lib/answer-key";
import { GradePassBadge } from "@/features/grades/components/grade-pass-badge";
import { saveExamGradingAction } from "@/features/member-exam-grading/actions/member-exam-grading.actions";
import { computeGradedScore } from "@/features/member-exam-grading/lib/grading-math";
import type {
  ExamGradingSheet,
  GradingQuestion,
} from "@/features/member-exam-grading/types/member-exam-grading.types";
import { cn } from "@/lib/utils";

/**
 * 수료시험 채점 화면 — 학생이 제출한 시험지를 문제별로 보며 "정답 처리"를 켜고 끕니다.
 * [저장]을 누르기 전에는 DB가 바뀌지 않고, 상단 점수는 미리보기로만 갱신됩니다.
 */
export function ExamGradingView({ sheet }: { sheet: ExamGradingSheet }) {
  const router = useRouter();
  const [manual, setManual] = useState<Set<string>>(() => new Set(sheet.manualGrades));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const live = useMemo(() => computeGradedScore(sheet.questions, manual), [sheet.questions, manual]);
  const isPassed = live.score >= sheet.passScore;

  const isDirty = useMemo(() => {
    if (manual.size !== sheet.manualGrades.length) return true;
    return sheet.manualGrades.some((id) => !manual.has(id));
  }, [manual, sheet.manualGrades]);

  function toggle(questionId: string) {
    setMessage(null);
    setErrorMessage(null);
    setManual((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  async function save() {
    setMessage(null);
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const result = await saveExamGradingAction(sheet.memberId, sheet.submissionId, [...manual]);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setMessage(result.message);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "채점 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  // 돌아갈 곳은 전체 화면이 아니라 회원목록의 상세 팝업 — 아기관리자는 팝업이 유일한 진입점입니다
  const memberHref = `/admin/members?overview=${sheet.memberId}`;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 text-xs text-[#8B95A1]">
            회원관리 <span className="mx-1">/</span>
            <Link href={memberHref} className="hover:underline">
              {sheet.memberName}
            </Link>
            <span className="mx-1">/</span>
            <span className="font-semibold text-[#191F28]">수료시험 채점</span>
          </div>
          <h1 className="text-[22px] font-bold text-[#191F28]">수료시험 채점</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {sheet.memberName} ({sheet.memberLoginId}) · {sheet.courseName} · {sheet.examName}
          </p>
        </div>
        <Link href={memberHref} className={cn(adminButtonVariants({ variant: "outline" }))}>
          회원 상세로
        </Link>
      </div>

      {/* 점수 요약 — 토글할 때마다 즉시 갱신되는 미리보기 */}
      <AdminCard>
        <AdminCardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
          <div>
            <div className="text-xs text-[#8B95A1]">현재 점수</div>
            <div className="mt-0.5 text-[28px] font-bold leading-none text-[#191F28]">
              {live.score}
              <span className="ml-1 text-base font-medium text-[#8B95A1]">/ {live.totalScore}점</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[#8B95A1]">합격 기준</div>
            <div className="mt-0.5 text-lg font-semibold text-[#4E5968]">{sheet.passScore}점 이상</div>
          </div>
          <div>
            <div className="text-xs text-[#8B95A1]">합격 여부</div>
            <div className="mt-1.5">
              <GradePassBadge isPassed={isPassed} />
            </div>
          </div>
          <div>
            <div className="text-xs text-[#8B95A1]">관리자 정답 처리</div>
            <div className="mt-0.5 text-lg font-semibold text-[#C2410C]">{manual.size}문제</div>
          </div>
          <div className="ml-auto text-xs text-[#8B95A1]">
            <div>학생 제출: {formatDateTime(sheet.submittedAt)}</div>
            {sheet.lastGradedAt ? (
              <div className="mt-0.5">
                마지막 채점: {sheet.lastGradedBy ?? "관리자"} · {formatDateTime(sheet.lastGradedAt)}
              </div>
            ) : null}
            {isDirty ? (
              <div className="mt-0.5 font-medium text-[#3182F6]">저장 전 미리보기 — [저장]을 눌러야 반영됩니다</div>
            ) : null}
          </div>
        </AdminCardContent>
      </AdminCard>

      {sheet.staleManualIds.length > 0 ? (
        <div className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-sm text-[#C2410C]">
          채점 이후 시험 문제가 변경되어 이전 정답 처리 {sheet.staleManualIds.length}건이 현재 문제와 맞지
          않습니다. 아래에서 다시 확인한 뒤 저장해주세요.
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">{message}</div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{errorMessage}</div>
      ) : null}

      {/* 문제 목록 */}
      <div className="space-y-3">
        {sheet.questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            manual={manual.has(question.id)}
            disabled={isSaving}
            onToggle={() => toggle(question.id)}
          />
        ))}
      </div>

      {/* 저장 */}
      <div className="flex items-center justify-end gap-2 border-t border-[#E5E8EB] pt-5">
        <Link href={memberHref} className={cn(adminButtonVariants({ variant: "outline" }))}>
          취소
        </Link>
        <AdminButton type="button" disabled={isSaving || !isDirty} onClick={save}>
          {isSaving ? "저장 중..." : "저장"}
        </AdminButton>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  manual,
  disabled,
  onToggle,
}: {
  question: GradingQuestion;
  manual: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const counted = question.autoCorrect || manual;
  const status = question.autoCorrect
    ? { label: "자동 정답", className: "bg-[#F0FDF4] text-[#059669]" }
    : manual
      ? { label: "관리자 정답처리", className: "bg-[#FFF7ED] text-[#C2410C]" }
      : question.studentAnswer
        ? { label: "오답", className: "bg-[#FEE2E2] text-[#EF4444]" }
        : { label: "미응답", className: "bg-[#F0F0F0] text-[#9CA3AF]" };

  return (
    <AdminCard className={cn(counted ? "" : "border-[#FECACA]")}>
      <AdminCardHeader className="flex flex-row items-start justify-between gap-3 border-0 pb-0">
        <div className="min-w-0">
          <AdminCardTitle className="text-[15px] leading-snug">
            <span className="mr-2 text-[#8B95A1]">{question.order}.</span>
            {question.question}
          </AdminCardTitle>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className={cn("inline-flex rounded-md px-2 py-0.5 font-medium", status.className)}>
              {status.label}
            </span>
            <span className="text-[#8B95A1]">배점 {question.score}점</span>
            <span className={cn("font-medium", counted ? "text-[#059669]" : "text-[#9CA3AF]")}>
              {counted ? `+${question.score}` : "+0"}
            </span>
          </div>
        </div>
        {/* 자동으로 맞은 문제는 건드릴 필요가 없으니 토글을 두지 않습니다 */}
        {question.autoCorrect ? null : (
          <AdminButton
            type="button"
            size="sm"
            variant={manual ? "primary" : "outline"}
            disabled={disabled}
            onClick={onToggle}
            className="shrink-0"
          >
            {manual ? "정답 처리됨 · 취소" : "정답 처리"}
          </AdminButton>
        )}
      </AdminCardHeader>
      <AdminCardContent className="pt-3">
        {question.choices.length > 0 ? (
          <ul className="space-y-1.5">
            {question.choices.map((choice) => {
              const isCorrect = isAnswerChoice(question.answer, choice.id);
              const isStudent = question.studentAnswer ? isAnswerChoice(question.studentAnswer, choice.id) : false;
              return (
                <li
                  key={choice.id}
                  className={cn(
                    "flex items-start gap-2 rounded-md px-3 py-2 text-sm",
                    isCorrect ? "bg-[#F0FDF4]" : isStudent ? "bg-[#FEF2F2]" : "bg-[#F9FAFB]",
                  )}
                >
                  <span className="w-5 shrink-0 text-[#8B95A1]">{choice.id}</span>
                  <span className="flex-1 text-[#333D4B]">{choice.text}</span>
                  <span className="flex shrink-0 gap-1 text-[11px]">
                    {isStudent ? (
                      <span className="rounded bg-white px-1.5 py-0.5 font-medium text-[#3182F6] ring-1 ring-[#3182F6]/30">
                        학생 선택
                      </span>
                    ) : null}
                    {isCorrect ? (
                      <span className="rounded bg-white px-1.5 py-0.5 font-medium text-[#059669] ring-1 ring-[#059669]/30">
                        정답
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-md bg-[#F9FAFB] px-3 py-2">
              <div className="text-[11px] text-[#8B95A1]">학생 답</div>
              <div className="mt-0.5 text-[#333D4B]">{question.studentAnswer ?? "(미응답)"}</div>
            </div>
            <div className="rounded-md bg-[#F0FDF4] px-3 py-2">
              <div className="text-[11px] text-[#8B95A1]">정답</div>
              <div className="mt-0.5 text-[#333D4B]">{formatAnswerKey(question.answer)}</div>
            </div>
          </div>
        )}
      </AdminCardContent>
    </AdminCard>
  );
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
