"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  MATERIAL_FILE_TYPES,
  MATERIAL_PUBLISH_FILTER_LABELS,
} from "@/features/learning-materials/constants";
import { buildMaterialListQueryString } from "@/features/learning-materials/lib/material-list-query";
import type {
  MaterialFilterOptions,
  MaterialListQuery,
} from "@/features/learning-materials/types/material.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type MaterialListToolbarProps = {
  query: MaterialListQuery;
  filterOptions: MaterialFilterOptions;
  onRegisterClick?: () => void;
  className?: string;
};

export function MaterialListToolbar({
  query,
  filterOptions,
  onRegisterClick,
  className,
}: MaterialListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const courseId = String(formData.get("courseId") ?? "").trim();
    const fileType = String(
      formData.get("fileType") ?? "",
    ) as MaterialListQuery["fileType"];
    const publish = String(
      formData.get("publish") ?? "",
    ) as MaterialListQuery["publish"];

    startTransition(() => {
      router.push(
        `/admin/learning-materials${buildMaterialListQueryString(
          { page: 1, search, courseId, fileType, publish },
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
          name="fileType"
          defaultValue={query.fileType}
          className={selectClassName}
          disabled={isPending}
        >
          <option value="">전체 종류</option>
          {MATERIAL_FILE_TYPES.map((fileType) => (
            <option key={fileType} value={fileType}>
              {fileType}
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
          {Object.entries(MATERIAL_PUBLISH_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <AdminInput
          name="search"
          variant="outline"
          defaultValue={query.search}
          placeholder="제목, 과정명으로 검색"
          className="sm:max-w-xs"
        />

        <AdminButton type="submit" disabled={isPending}>
          <Search className="size-4" />
          검색
        </AdminButton>
      </form>

      <AdminButton type="button" onClick={onRegisterClick}>
        <Plus className="size-4" />
        자료등록
      </AdminButton>
    </div>
  );
}
