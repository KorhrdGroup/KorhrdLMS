"use client";

import { Download, MessageSquare, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { MemberRestoreButton } from "@/features/members/components/member-restore-button";
import {
  MEMBER_SEARCH_FIELD_LABELS,
  type MemberSearchField,
} from "@/features/members/constants";
import { buildListQueryString, type ListQuery } from "@/lib/shared/list-query";
import { cn } from "@/lib/utils";

type MemberListToolbarProps = {
  query: ListQuery;
  selectedCount: number;
  deletableSelectedCount: number;
  restorableSelectedCount: number;
  onDeleteClick?: () => void;
  onRestoreClick?: () => void;
  className?: string;
};

export function MemberListToolbar({
  query,
  selectedCount,
  deletableSelectedCount,
  restorableSelectedCount,
  onDeleteClick,
  onRestoreClick,
  className,
}: MemberListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as MemberSearchField;

    startTransition(() => {
      router.push(
        `/admin/members${buildListQueryString({ page: 1, search, field }, query)}`,
      );
    });
  }

  function handleShowDeletedToggle(checked: boolean) {
    startTransition(() => {
      router.push(
        `/admin/members${buildListQueryString({ page: 1, showDeleted: checked }, query)}`,
      );
    });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <form
          className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={handleSearchSubmit}
        >
          <select
            name="field"
            defaultValue={query.field}
            className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
          >
            {Object.entries(MEMBER_SEARCH_FIELD_LABELS).map(([value, label]) => (
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

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#374151]">
            <AdminCheckbox
              checked={query.showDeleted === true}
              onChange={(event) => handleShowDeletedToggle(event.target.checked)}
              aria-label="삭제회원 보기"
            />
            삭제회원 보기
          </label>

          <AdminButton
            type="button"
            variant="destructive"
            disabled={deletableSelectedCount === 0}
            onClick={onDeleteClick}
          >
            <Trash2 className="size-4" />
            선택 삭제
          </AdminButton>
          {query.showDeleted ? (
            <MemberRestoreButton
              disabled={restorableSelectedCount === 0}
              onClick={onRestoreClick}
            />
          ) : null}
          <AdminButton variant="outline" disabled title="준비 중">
            <Download className="size-4" />
            Excel
          </AdminButton>
          <AdminButton variant="outline" disabled title="준비 중">
            <MessageSquare className="size-4" />
            문자발송
          </AdminButton>
        </div>
      </div>

      {selectedCount > 0 ? (
        <p className="text-sm text-[#3B82F6]">{selectedCount}명 선택됨</p>
      ) : null}

      {query.showDeleted ? (
        <p className="text-sm text-[#6B7280]">
          휴지통에 있는 삭제 회원을 포함해 표시합니다. 삭제 회원은 회색으로 구분됩니다.
        </p>
      ) : null}
    </div>
  );
}
