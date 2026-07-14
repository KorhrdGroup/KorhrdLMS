"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  EXAM_RESULT_PASS_FILTER_LABELS,
  EXAM_RESULT_SEARCH_FIELD_LABELS,
} from "@/features/exam-results/constants";
import { buildExamResultListQueryString } from "@/features/exam-results/lib/exam-result-list-query";
import type {
  ExamResultListQuery,
  ExamResultPassFilter,
  ExamResultSearchField,
} from "@/features/exam-results/types/exam-result.types";
import { cn } from "@/lib/utils";

type ExamResultListToolbarProps = {
  query: ExamResultListQuery;
  className?: string;
};

export function ExamResultListToolbar({ query, className }: ExamResultListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as ExamResultSearchField;
    const pass = String(formData.get("pass") ?? "all") as ExamResultPassFilter;

    startTransition(() => {
      router.push(
        `/admin/exam-results${buildExamResultListQueryString({ page: 1, search, field, pass }, query)}`,
      );
    });
  }

  return (
    <form
      className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className)}
      onSubmit={handleSearchSubmit}
    >
      <select
        name="field"
        defaultValue={query.field}
        className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
      >
        {Object.entries(EXAM_RESULT_SEARCH_FIELD_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <AdminInput
        name="search"
        variant="outline"
        defaultValue={query.search}
        placeholder="학생명, 아이디, 과정명, 시험명으로 검색"
        className="sm:max-w-xs"
      />

      <select
        name="pass"
        defaultValue={query.pass}
        className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
      >
        {Object.entries(EXAM_RESULT_PASS_FILTER_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <AdminButton type="submit" disabled={isPending}>
        <Search className="size-4" />
        검색
      </AdminButton>
    </form>
  );
}
