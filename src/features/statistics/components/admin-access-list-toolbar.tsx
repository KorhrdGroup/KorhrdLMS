"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  ADMIN_ACCESS_QUICK_PERIOD_OPTIONS,
  ADMIN_TYPE_FILTER_OPTIONS,
  ADMIN_TYPE_LABELS,
} from "@/features/statistics/constants";
import {
  buildAdminAccessListQueryString,
  resolveQuickPeriodRange,
} from "@/features/statistics/lib/admin-access-list-query";
import type { AdminAccessListQuery } from "@/features/statistics/types/admin-access.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type AdminAccessListToolbarProps = {
  query: AdminAccessListQuery;
  className?: string;
};

export function AdminAccessListToolbar({ query, className }: AdminAccessListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(next: Partial<AdminAccessListQuery>) {
    startTransition(() => {
      router.push(
        `/admin/statistics/admin-access${buildAdminAccessListQueryString(next, query)}`,
      );
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const adminType = String(formData.get("adminType") ?? "").trim();
    const startDate = String(formData.get("startDate") ?? "").trim();
    const endDate = String(formData.get("endDate") ?? "").trim();
    const adminName = String(formData.get("adminName") ?? "").trim();

    navigate({
      page: 1,
      adminType: adminType as AdminAccessListQuery["adminType"],
      quickPeriod: "",
      startDate,
      endDate,
      adminName,
    });
  }

  function handleQuickPeriodClick(quickPeriod: AdminAccessListQuery["quickPeriod"]) {
    const range = resolveQuickPeriodRange(quickPeriod);
    navigate({
      page: 1,
      quickPeriod,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <form
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={handleSearchSubmit}
      >
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">관리자유형</span>
          <select
            name="adminType"
            defaultValue={query.adminType}
            className={cn(selectClassName, "w-full")}
            disabled={isPending}
          >
            <option value="">전체</option>
            {ADMIN_TYPE_FILTER_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {ADMIN_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 md:col-span-2 xl:col-span-3">
          <span className="block text-sm font-medium text-[#374151]">기간 빠른검색</span>
          <div className="flex flex-wrap gap-2">
            {ADMIN_ACCESS_QUICK_PERIOD_OPTIONS.map((option) => (
              <AdminButton
                key={option.value}
                type="button"
                variant={query.quickPeriod === option.value ? "primary" : "outline"}
                size="sm"
                disabled={isPending}
                onClick={() => handleQuickPeriodClick(option.value)}
              >
                {option.label}
              </AdminButton>
            ))}
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">시작일</span>
          <AdminInput
            name="startDate"
            type="date"
            variant="outline"
            defaultValue={query.startDate}
            disabled={isPending}
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">종료일</span>
          <AdminInput
            name="endDate"
            type="date"
            variant="outline"
            defaultValue={query.endDate}
            disabled={isPending}
          />
        </label>

        <label className="space-y-1.5 md:col-span-2">
          <span className="block text-sm font-medium text-[#374151]">관리자명 검색</span>
          <AdminInput
            name="adminName"
            variant="outline"
            defaultValue={query.adminName}
            placeholder="관리자명 또는 아이디"
            disabled={isPending}
          />
        </label>

        <div className="flex items-end">
          <AdminButton type="submit" disabled={isPending}>
            <Search className="size-4" />
            검색
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
