"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  EXAM_KIND_LABELS,
  EXAM_PUBLISH_FILTER_LABELS,
} from "@/features/exam-management/constants";
import { buildExamListQueryString } from "@/features/exam-management/lib/exam-list-query";
import type {
  ExamFilterOptions,
  ExamListQuery,
} from "@/features/exam-management/types/exam.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type ExamListToolbarProps = {
  query: ExamListQuery;
  filterOptions: ExamFilterOptions;
  onRegisterClick?: () => void;
  className?: string;
};

export function ExamListToolbar({
  query,
  filterOptions,
  onRegisterClick,
  className,
}: ExamListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const courseId = String(formData.get("courseId") ?? "").trim();
    const examKind = String(
      formData.get("examKind") ?? "",
    ) as ExamListQuery["examKind"];
    const publish = String(formData.get("publish") ?? "") as ExamListQuery["publish"];

    startTransition(() => {
      router.push(
        `/admin/exams${buildExamListQueryString(
          { page: 1, search, courseId, examKind, publish },
          query,
        )}`,
      );
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <form
        className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
        onSubmit={handleSearchSubmit}
      >
        <select
          name="courseId"
          defaultValue={query.courseId}
          className={selectClassName}
          disabled={isPending}
        >
          <option value="">전체 과정</option>
          {filterOptions.courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <select
          name="examKind"
          defaultValue={query.examKind}
          className={selectClassName}
          disabled={isPending}
        >
          <option value="">전체 종류</option>
          {Object.entries(EXAM_KIND_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          name="publish"
          defaultValue={query.publish}
          className={selectClassName}
          disabled={isPending}
        >
          <option value="">전체 상태</option>
          {Object.entries(EXAM_PUBLISH_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <AdminInput
          name="search"
          variant="outline"
          defaultValue={query.search}
          placeholder="시험명, 과정명으로 검색"
          className="sm:max-w-xs"
        />

        <AdminButton type="submit" disabled={isPending}>
          <Search className="size-4" />
          검색
        </AdminButton>
      </form>

      <AdminButton type="button" onClick={onRegisterClick}>
        <Plus className="size-4" />
        시험등록
      </AdminButton>
    </div>
  );
}
