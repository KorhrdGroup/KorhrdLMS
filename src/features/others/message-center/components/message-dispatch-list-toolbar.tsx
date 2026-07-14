"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  MESSAGE_CHANNEL_FILTER_OPTIONS,
  MESSAGE_CHANNEL_LABELS,
  MESSAGE_DISPATCH_TYPE_FILTER_OPTIONS,
  MESSAGE_DISPATCH_TYPE_LABELS,
  MESSAGE_QUICK_PERIOD_OPTIONS,
  MESSAGE_SEND_STATUS_FILTER_OPTIONS,
  MESSAGE_SEND_STATUS_LABELS,
} from "@/features/others/message-center/constants";
import {
  buildMessageDispatchListQueryString,
  resolveQuickPeriodRange,
} from "@/features/others/message-center/lib/message-dispatch-list-query";
import type { MessageDispatchListQuery } from "@/features/others/message-center/types/message-dispatch.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type MessageDispatchListToolbarProps = {
  query: MessageDispatchListQuery;
};

export function MessageDispatchListToolbar({ query }: MessageDispatchListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(next: Partial<MessageDispatchListQuery>) {
    startTransition(() => {
      router.push(
        `/admin/others/message-center${buildMessageDispatchListQueryString(next, query)}`,
      );
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    navigate({
      page: 1,
      channel: String(formData.get("channel") ?? "").trim() as MessageDispatchListQuery["channel"],
      dispatchType: String(formData.get("dispatchType") ?? "").trim() as MessageDispatchListQuery["dispatchType"],
      status: String(formData.get("status") ?? "").trim() as MessageDispatchListQuery["status"],
      quickPeriod: "",
      startDate: String(formData.get("startDate") ?? "").trim(),
      endDate: String(formData.get("endDate") ?? "").trim(),
      search: String(formData.get("search") ?? "").trim(),
    });
  }

  function handleQuickPeriodClick(quickPeriod: MessageDispatchListQuery["quickPeriod"]) {
    const range = resolveQuickPeriodRange(quickPeriod);
    navigate({
      page: 1,
      quickPeriod,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSearchSubmit}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">채널</span>
          <select
            name="channel"
            defaultValue={query.channel}
            className={cn(selectClassName, "w-full")}
            disabled={isPending}
          >
            <option value="">전체</option>
            {MESSAGE_CHANNEL_FILTER_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {MESSAGE_CHANNEL_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">발송유형</span>
          <select
            name="dispatchType"
            defaultValue={query.dispatchType}
            className={cn(selectClassName, "w-full")}
            disabled={isPending}
          >
            <option value="">전체</option>
            {MESSAGE_DISPATCH_TYPE_FILTER_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {MESSAGE_DISPATCH_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">발송상태</span>
          <select
            name="status"
            defaultValue={query.status}
            className={cn(selectClassName, "w-full")}
            disabled={isPending}
          >
            <option value="">전체</option>
            {MESSAGE_SEND_STATUS_FILTER_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {MESSAGE_SEND_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 md:col-span-2 xl:col-span-4">
          <span className="block text-sm font-medium text-[#374151]">기간 빠른검색</span>
          <div className="flex flex-wrap gap-2">
            {MESSAGE_QUICK_PERIOD_OPTIONS.map((option) => (
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
          <span className="block text-sm font-medium text-[#374151]">검색</span>
          <AdminInput
            name="search"
            variant="outline"
            defaultValue={query.search}
            placeholder="수신자, 내용, 제목 검색"
            disabled={isPending}
          />
        </label>

        <div className="flex items-end">
          <AdminButton type="submit" disabled={isPending}>
            <Search className="size-4" />
            검색
          </AdminButton>
        </div>
      </div>
    </form>
  );
}
