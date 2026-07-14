"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, Info } from "lucide-react";

import {
  CLASSROOM_EXAM_STATUS_BADGE_CLASS,
  CLASSROOM_EXAM_STATUS_LABEL,
} from "@/features/classroom-exams/constants";
import { EXAM_KIND_LABELS } from "@/features/exam-management/constants";
import type {
  ClassroomExamList,
  ClassroomExamListItem,
} from "@/features/classroom-exams/types/classroom-exam.types";
import { figma, figmaClass } from "@/components/home/home-design";
import { formatDate } from "@/lib/shared/format-date";
import { cn } from "@/lib/utils";

function buildNoticeItems(threshold: number, startDate: string, endDate: string): string[] {
  return [
    `수강 진도율(출석률) ${threshold}% 이상부터 시험 응시가 가능합니다.`,
    `시험 응시 가능 기간은 수강기간과 동일합니다. (${formatDate(startDate)} ~ ${formatDate(endDate)})`,
    "시험 응시는 1회이며, 제출 후에는 답안을 수정할 수 없습니다.",
    "시험 응시 전 다른 프로그램은 모두 종료해주세요.",
    "네트워크 오류로 인한 답안 유실은 재응시 사유가 되지 않습니다.",
  ];
}

export function ExamListBoard({ slug, examList }: { slug: string; examList: ClassroomExamList }) {
  const { exams, progressRate, eligibilityThreshold, enrollmentStartDate, enrollmentEndDate } =
    examList;

  return (
    <div>
      <h2 className={cn(figma.typography.sectionTitle, "mb-1", figmaClass.textPrimary)}>시험</h2>
      <p className={cn("mb-4 text-[13px]", figmaClass.textPlaceholder)}>
        현재 진도율 {progressRate}% · 응시 기준 {eligibilityThreshold}% · 수강기간{" "}
        {formatDate(enrollmentStartDate)} ~ {formatDate(enrollmentEndDate)}
      </p>

      {exams.length === 0 ? (
        <div
          className={cn(
            "flex items-center justify-center border px-6 py-16 text-center text-[14px]",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
            figmaClass.textPlaceholder,
          )}
        >
          등록된 시험이 존재하지 않습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              slug={slug}
              exam={exam}
              eligibilityThreshold={eligibilityThreshold}
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#f7f8fa] px-5 py-4">
        <Info className="mt-0.5 size-4 shrink-0 text-[#919191]" />
        <ul className={cn("space-y-1.5 text-[12.5px] leading-relaxed", figmaClass.textMuted)}>
          {buildNoticeItems(eligibilityThreshold, enrollmentStartDate, enrollmentEndDate).map(
            (item) => (
              <li key={item}>· {item}</li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

function ExamCard({
  slug,
  exam,
  eligibilityThreshold,
}: {
  slug: string;
  exam: ClassroomExamListItem;
  eligibilityThreshold: number;
}) {
  const router = useRouter();
  const clickable = exam.status === "available" || exam.status === "submitted";
  const lockedMessage = `진도율 ${eligibilityThreshold}% 이상부터 응시 가능합니다.`;

  const handleClick = () => {
    if (!clickable) {
      if (exam.status === "locked") {
        window.alert(lockedMessage);
      } else if (exam.status === "upcoming") {
        window.alert("아직 수강기간이 시작되지 않았습니다.");
      } else if (exam.status === "closed") {
        window.alert("수강기간이 종료되어 응시할 수 없습니다.");
      }
      return;
    }
    router.push(`/classroom/${slug}/exam/${exam.id}`);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        figmaClass.roundedCard,
        figmaClass.borderDefault,
        figmaClass.whiteBg,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e5edff]">
          <ClipboardList className="size-5" style={{ color: figma.colors.primary }} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("text-[16px] font-bold", figmaClass.textPrimary)}>{exam.title}</h3>
            <span className="inline-flex rounded-full bg-[#f1f1f1] px-2.5 py-1 text-[11px] font-bold text-[#616161]">
              {EXAM_KIND_LABELS[exam.examKind]}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                CLASSROOM_EXAM_STATUS_BADGE_CLASS[exam.status],
              )}
            >
              {CLASSROOM_EXAM_STATUS_LABEL[exam.status]}
            </span>
          </div>
          <p className={cn("mt-1.5 text-[13px]", figmaClass.textPlaceholder)}>
            제한시간 {exam.durationMinutes}분 · {exam.questionCount}문항
          </p>
          {exam.status === "submitted" ? (
            <p className={cn("mt-1 text-[13px] font-semibold", figmaClass.textSub)}>
              획득 점수 {exam.score}
              {exam.totalScore !== null ? ` / ${exam.totalScore}` : ""}점
              {exam.isPassed !== null ? (exam.isPassed ? " · 합격" : " · 불합격") : ""}
            </p>
          ) : null}
          {exam.status === "locked" ? (
            <p className="mt-1 text-[13px] font-semibold text-[#e5433f]">{lockedMessage}</p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={!clickable}
        className={cn(
          "flex h-11 shrink-0 items-center justify-center rounded-lg px-6 text-[14px] font-bold text-white transition-all duration-200",
          clickable ? "hover:brightness-110" : "cursor-not-allowed opacity-50",
        )}
        style={{ backgroundColor: figma.colors.primary }}
      >
        {exam.status === "submitted" ? "결과보기" : "시험보기"}
      </button>
    </div>
  );
}
