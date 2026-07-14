"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  EXAM_KIND_LABELS,
  EXAM_TYPE_LABELS,
} from "@/features/exams/constants";
import { buildExamQuestionListQueryString } from "@/features/exams/lib/exam-question-list-query";
import type {
  ExamQuestionFilterOptions,
  ExamQuestionListQuery,
} from "@/features/exams/types/exam-question.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type ExamQuestionListToolbarProps = {
  query: ExamQuestionListQuery;
  filterOptions: ExamQuestionFilterOptions;
  className?: string;
};

export function ExamQuestionListToolbar({
  query,
  filterOptions,
  className,
}: ExamQuestionListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const courseId = String(formData.get("courseId") ?? "").trim();
    const examKind = String(formData.get("examKind") ?? "").trim();
    const examType = String(formData.get("examType") ?? "").trim();

    startTransition(() => {
      router.push(
        `/admin/exams/questions${buildExamQuestionListQueryString(
          { page: 1, courseId, examKind, examType },
          query,
        )}`,
      );
    });
  }

  return (
    <form
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end",
        className,
      )}
      onSubmit={handleSearchSubmit}
    >
      <label className="space-y-1.5 sm:min-w-[200px] sm:flex-1">
        <span className="block text-sm font-medium text-[#374151]">과정 선택</span>
        <select
          name="courseId"
          defaultValue={query.courseId}
          className={cn(selectClassName, "w-full")}
          disabled={isPending}
        >
          <option value="">전체 과정</option>
          {filterOptions.courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5 sm:min-w-[160px]">
        <span className="block text-sm font-medium text-[#374151]">시험종류 선택</span>
        <select
          name="examKind"
          defaultValue={query.examKind}
          className={cn(selectClassName, "w-full")}
          disabled={isPending}
        >
          <option value="">전체 시험종류</option>
          {filterOptions.examKinds.map((kind) => (
            <option key={kind} value={kind}>
              {EXAM_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5 sm:min-w-[160px]">
        <span className="block text-sm font-medium text-[#374151]">시험유형 선택</span>
        <select
          name="examType"
          defaultValue={query.examType}
          className={cn(selectClassName, "w-full")}
          disabled={isPending}
        >
          <option value="">전체 시험유형</option>
          {filterOptions.examTypes.map((type) => (
            <option key={type} value={type}>
              {EXAM_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <AdminButton type="submit" disabled={isPending}>
        <Search className="size-4" />
        검색
      </AdminButton>
    </form>
  );
}
