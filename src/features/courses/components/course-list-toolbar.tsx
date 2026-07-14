"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  COURSE_SEARCH_FIELD_LABELS,
  type CourseSearchField,
} from "@/features/courses/constants";
import { buildCourseListQueryString } from "@/features/courses/lib/course-list-query";
import type { CourseListQuery } from "@/features/courses/services/course-list.service";
import { cn } from "@/lib/utils";

type CourseListToolbarProps = {
  query: CourseListQuery;
  onRegisterClick?: () => void;
  className?: string;
};

export function CourseListToolbar({
  query,
  onRegisterClick,
  className,
}: CourseListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as CourseSearchField;

    startTransition(() => {
      router.push(
        `/admin/courses${buildCourseListQueryString({ page: 1, search, field }, query)}`,
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
        className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={handleSearchSubmit}
      >
        <select
          name="field"
          defaultValue={query.field}
          className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
        >
          {Object.entries(COURSE_SEARCH_FIELD_LABELS).map(([value, label]) => (
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

      <AdminButton type="button" onClick={onRegisterClick}>
        <Plus className="size-4" />
        과정등록
      </AdminButton>
    </div>
  );
}
