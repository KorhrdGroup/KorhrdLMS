"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { buildNoticePopupListQueryString } from "@/features/others/notice-popups/lib/notice-popup-list-query";
import type { NoticePopupListQuery } from "@/features/others/notice-popups/types/notice-popup.types";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type NoticePopupListToolbarProps = {
  query: NoticePopupListQuery;
};

export function NoticePopupListToolbar({ query }: NoticePopupListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      router.push(
        `/admin/others/notice-popups${buildNoticePopupListQueryString(
          {
            page: 1,
            search: String(formData.get("search") ?? "").trim(),
            isActive: String(formData.get("isActive") ?? "").trim() as NoticePopupListQuery["isActive"],
            isNotice: String(formData.get("isNotice") ?? "").trim() as NoticePopupListQuery["isNotice"],
          },
          query,
        )}`,
      );
    });
  }

  return (
    <form
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      onSubmit={handleSearchSubmit}
    >
      <label className="space-y-1.5">
        <span className="block text-sm font-medium text-[#374151]">팝업 활성</span>
        <select
          name="isActive"
          defaultValue={query.isActive}
          className={cn(selectClassName, "w-full")}
          disabled={isPending}
        >
          <option value="">전체</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
      </label>

      <label className="space-y-1.5">
        <span className="block text-sm font-medium text-[#374151]">공지</span>
        <select
          name="isNotice"
          defaultValue={query.isNotice}
          className={cn(selectClassName, "w-full")}
          disabled={isPending}
        >
          <option value="">전체</option>
          <option value="true">공지</option>
          <option value="false">일반</option>
        </select>
      </label>

      <label className="space-y-1.5 md:col-span-2">
        <span className="block text-sm font-medium text-[#374151]">검색</span>
        <AdminInput
          name="search"
          variant="outline"
          defaultValue={query.search}
          placeholder="제목, 내용 검색"
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
  );
}
