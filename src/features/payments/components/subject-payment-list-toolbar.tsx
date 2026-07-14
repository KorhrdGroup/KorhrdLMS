"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  COURSE_PAYMENT_STATUS_FILTER_OPTIONS,
  COURSE_PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SUBJECT_PAYMENT_QUICK_PERIOD_OPTIONS,
} from "@/features/payments/constants";
import {
  buildSubjectPaymentListQueryString,
  resolveQuickPeriodRange,
} from "@/features/payments/lib/subject-payment-list-query";
import type { SubjectPaymentListQuery } from "@/features/payments/types/subject-payment.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type SubjectPaymentListToolbarProps = {
  query: SubjectPaymentListQuery;
  className?: string;
};

export function SubjectPaymentListToolbar({
  query,
  className,
}: SubjectPaymentListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(next: Partial<SubjectPaymentListQuery>) {
    startTransition(() => {
      router.push(
        `/admin/payments/subjects${buildSubjectPaymentListQueryString(next, query)}`,
      );
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const paymentMethod = String(formData.get("paymentMethod") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();
    const startDate = String(formData.get("startDate") ?? "").trim();
    const endDate = String(formData.get("endDate") ?? "").trim();
    const memberName = String(formData.get("memberName") ?? "").trim();

    navigate({
      page: 1,
      paymentMethod: paymentMethod as SubjectPaymentListQuery["paymentMethod"],
      status: status as SubjectPaymentListQuery["status"],
      quickPeriod: "",
      startDate,
      endDate,
      memberName,
    });
  }

  function handleQuickPeriodClick(quickPeriod: SubjectPaymentListQuery["quickPeriod"]) {
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
          <span className="block text-sm font-medium text-[#374151]">결제방법</span>
          <select
            name="paymentMethod"
            defaultValue={query.paymentMethod}
            className={cn(selectClassName, "w-full")}
            disabled={isPending}
          >
            <option value="">전체</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">상태</span>
          <select
            name="status"
            defaultValue={query.status}
            className={cn(selectClassName, "w-full")}
            disabled={isPending}
          >
            <option value="">전체</option>
            {COURSE_PAYMENT_STATUS_FILTER_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {COURSE_PAYMENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 md:col-span-2 xl:col-span-2">
          <span className="block text-sm font-medium text-[#374151]">
            기간 빠른검색
          </span>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_PAYMENT_QUICK_PERIOD_OPTIONS.map((option) => (
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
          <span className="block text-sm font-medium text-[#374151]">회원명 검색</span>
          <AdminInput
            name="memberName"
            variant="outline"
            defaultValue={query.memberName}
            placeholder="회원명 또는 아이디"
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
