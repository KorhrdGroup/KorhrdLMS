"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  NOTICE_PINNED_FILTER_LABELS,
  NOTICE_PUBLISH_FILTER_LABELS,
} from "@/features/notice-management/constants";
import { buildNoticeListQueryString } from "@/features/notice-management/lib/notice-list-query";
import type { NoticeListQuery } from "@/features/notice-management/types/notice.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type NoticeListToolbarProps = {
  query: NoticeListQuery;
  onRegisterClick?: () => void;
  className?: string;
};

export function NoticeListToolbar({
  query,
  onRegisterClick,
  className,
}: NoticeListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const pinned = String(formData.get("pinned") ?? "") as NoticeListQuery["pinned"];
    const publish = String(formData.get("publish") ?? "") as NoticeListQuery["publish"];

    startTransition(() => {
      router.push(
        `/admin/notices${buildNoticeListQueryString(
          { page: 1, search, pinned, publish },
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
          name="pinned"
          defaultValue={query.pinned}
          className={selectClassName}
          disabled={isPending}
        >
          <option value="">전체 고정상태</option>
          {Object.entries(NOTICE_PINNED_FILTER_LABELS).map(([value, label]) => (
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
          {Object.entries(NOTICE_PUBLISH_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <AdminInput
          name="search"
          variant="outline"
          defaultValue={query.search}
          placeholder="제목으로 검색"
          className="sm:max-w-xs"
        />

        <AdminButton type="submit" disabled={isPending}>
          <Search className="size-4" />
          검색
        </AdminButton>
      </form>

      <AdminButton type="button" onClick={onRegisterClick}>
        <Plus className="size-4" />
        공지등록
      </AdminButton>
    </div>
  );
}
