"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  ENROLLMENT_SEARCH_FIELD_LABELS,
  type EnrollmentSearchField,
} from "@/features/enrollments/constants";
import { buildEnrollmentRecordListQueryString } from "@/features/enrollments/lib/enrollment-record-list-query";
import type {
  EnrollmentLearningStatusFilter,
  EnrollmentRecordListQuery,
} from "@/features/enrollments/services/enrollment-record-list.service";
import { cn } from "@/lib/utils";

const LEARNING_STATUS_FILTER_LABELS: Record<EnrollmentLearningStatusFilter, string> = {
  all: "전체 상태",
  in_progress: "수강중",
  ended: "종료",
  stopped: "중지",
};

type EnrollmentListToolbarProps = {
  query: EnrollmentRecordListQuery;
  onRegisterClick?: () => void;
  className?: string;
};

export function EnrollmentListToolbar({
  query,
  onRegisterClick,
  className,
}: EnrollmentListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as EnrollmentSearchField;
    const learningStatus = String(
      formData.get("learningStatus") ?? "all",
    ) as EnrollmentLearningStatusFilter;

    startTransition(() => {
      router.push(
        `/admin/enrollments${buildEnrollmentRecordListQueryString(
          { page: 1, search, field, learningStatus },
          query,
        )}`,
      );
    });
  }

  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between", className)}>
      <form
        className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={handleSearchSubmit}
      >
        <select
          name="field"
          defaultValue={query.field}
          className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
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
          placeholder="회원명, 아이디, 과정명으로 검색"
          className="sm:max-w-xs"
        />

        <select
          name="learningStatus"
          defaultValue={query.learningStatus}
          className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
        >
          {Object.entries(LEARNING_STATUS_FILTER_LABELS).map(([value, label]) => (
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

      <AdminButton type="button" onClick={onRegisterClick}>
        <Plus className="size-4" />
        수강등록
      </AdminButton>
    </div>
  );
}
