"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { buildClassListQueryString } from "@/features/enrollments/lib/class-list-query";
import type {
  ClassFilterOptions,
  ClassListQuery,
} from "@/features/enrollments/types/class.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type ClassListToolbarProps = {
  query: ClassListQuery;
  filterOptions: ClassFilterOptions;
  className?: string;
};

export function ClassListToolbar({
  query,
  filterOptions,
  className,
}: ClassListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const courseId = String(formData.get("courseId") ?? "").trim();
    const year = String(formData.get("year") ?? "").trim();

    startTransition(() => {
      router.push(
        `/admin/enrollments/classes${buildClassListQueryString({ page: 1, courseId, year }, query)}`,
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
        <span className="block text-sm font-medium text-[#374151]">연도 선택</span>
        <select
          name="year"
          defaultValue={query.year}
          className={cn(selectClassName, "w-full")}
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

      <AdminButton type="submit" disabled={isPending}>
        <Search className="size-4" />
        검색
      </AdminButton>
    </form>
  );
}
