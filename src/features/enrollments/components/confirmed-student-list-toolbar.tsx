"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  ENROLLMENT_SEARCH_FIELD_LABELS,
  ENROLLMENT_STATUS_LABELS,
  type PendingApplicantSearchField,
} from "@/features/enrollments/constants";
import { buildConfirmedStudentListQueryString } from "@/features/enrollments/lib/confirmed-student-list-query";
import type {
  ConfirmedStudentFilterOptions,
  ConfirmedStudentListQuery,
} from "@/features/enrollments/types/confirmed-student.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type ConfirmedStudentListToolbarProps = {
  query: ConfirmedStudentListQuery;
  filterOptions: ConfirmedStudentFilterOptions;
  className?: string;
};

export function ConfirmedStudentListToolbar({
  query,
  filterOptions,
  className,
}: ConfirmedStudentListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(next: Partial<ConfirmedStudentListQuery>) {
    startTransition(() => {
      router.push(
        `/admin/enrollments/confirmed${buildConfirmedStudentListQueryString(next, query)}`,
      );
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as PendingApplicantSearchField;

    navigate({ page: 1, search, field });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">과정 선택</span>
          <select
            className={cn(selectClassName, "w-full")}
            value={query.courseId}
            onChange={(event) => navigate({ page: 1, courseId: event.target.value })}
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

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">연도 선택</span>
          <select
            className={cn(selectClassName, "w-full")}
            value={query.year}
            onChange={(event) => navigate({ page: 1, year: event.target.value })}
            disabled={isPending}
          >
            <option value="">전체 연도</option>
            {filterOptions.years.map((year) => (
              <option key={year} value={String(year)}>
                {year}년
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">반 선택</span>
          <select
            className={cn(selectClassName, "w-full")}
            value={query.batch}
            onChange={(event) => navigate({ page: 1, batch: event.target.value })}
            disabled={isPending}
          >
            <option value="">전체 반</option>
            {filterOptions.batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">상태 선택</span>
          <select
            className={cn(selectClassName, "w-full")}
            value={query.status}
            onChange={(event) => navigate({ page: 1, status: event.target.value })}
            disabled={isPending}
          >
            <option value="confirmed">{ENROLLMENT_STATUS_LABELS.confirmed}</option>
          </select>
        </label>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={handleSearchSubmit}
      >
        <select
          name="field"
          defaultValue={query.field}
          className={selectClassName}
        >
          {Object.entries(ENROLLMENT_SEARCH_FIELD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <AdminInput
          name="search"
          variant="outline"
          defaultValue={query.search}
          placeholder="검색어를 입력하세요"
          className="sm:max-w-xs"
        />

        <AdminButton type="submit" disabled={isPending}>
          <Search className="size-4" />
          검색
        </AdminButton>
      </form>
    </div>
  );
}
