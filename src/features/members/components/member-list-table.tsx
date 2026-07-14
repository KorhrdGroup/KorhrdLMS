"use client";

import Link from "next/link";
import { useMemo } from "react";

import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { MemberCourseSummaryList } from "@/features/members/components/member-course-summary-list";
import { MemberHistoryMemoCell } from "@/features/members/components/member-history-memo-cell";
import { MemberRestoreButton } from "@/features/members/components/member-restore-button";
import { isMemberDeleted } from "@/features/members/constants";
import type { MemberListRow } from "@/features/members/types/member-list.types";
import { formatDate, formatDateTime } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";
import { cn } from "@/lib/utils";

type MemberListTableProps = {
  result: PaginatedResult<MemberListRow>;
  selectedIds: string[];
  showDeleted?: boolean;
  onSelectionChange: (ids: string[]) => void;
  onMemberClick?: (member: MemberListRow) => void;
  onRestoreClick?: (memberId: string) => void;
};

export function MemberListTable({
  result,
  selectedIds,
  showDeleted = false,
  onSelectionChange,
  onMemberClick,
  onRestoreClick,
}: MemberListTableProps) {
  const pageIds = useMemo(
    () => result.data.map((member) => member.id),
    [result.data],
  );

  const isAllSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  function updateSelection(next: string[]) {
    onSelectionChange(next);
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      updateSelection(Array.from(new Set([...selectedIds, ...pageIds])));
      return;
    }

    updateSelection(selectedIds.filter((id) => !pageIds.includes(id)));
  }

  function toggleOne(id: string, checked: boolean) {
    if (checked) {
      updateSelection(Array.from(new Set([...selectedIds, id])));
      return;
    }

    updateSelection(selectedIds.filter((selectedId) => selectedId !== id));
  }

  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <AdminTable>
      <AdminTableHeader>
        <AdminTableRow className="hover:bg-transparent">
          <AdminTableHead className="w-12">
            <AdminCheckbox
              checked={isAllSelected}
              onChange={(event) => toggleAll(event.target.checked)}
              aria-label="현재 페이지 전체 선택"
            />
          </AdminTableHead>
          <AdminTableHead className="w-12">No</AdminTableHead>
          <AdminTableHead className="min-w-[100px] whitespace-nowrap">이름</AdminTableHead>
          <AdminTableHead className="min-w-[120px] whitespace-nowrap">아이디</AdminTableHead>
          <AdminTableHead className="min-w-[140px] whitespace-nowrap">연락처</AdminTableHead>
          <AdminTableHead>수강과정</AdminTableHead>
          <AdminTableHead>회원정보이력</AdminTableHead>
          <AdminTableHead className="whitespace-nowrap">가입일</AdminTableHead>
          <AdminTableHead className="whitespace-nowrap">최근 로그인</AdminTableHead>
          <AdminTableHead className="whitespace-nowrap">담당자</AdminTableHead>
          {showDeleted ? <AdminTableHead className="w-24">관리</AdminTableHead> : null}
        </AdminTableRow>
      </AdminTableHeader>
      <AdminTableBody>
        {result.data.map((member, index) => {
          const rowNumber =
            result.total - (result.page - 1) * result.pageSize - index;
          const deleted = isMemberDeleted(member);
          const canOpenEdit = !deleted && onMemberClick;

          return (
            <AdminTableRow
              key={member.id}
              className={cn(
                deleted && "bg-[#F9FAFB] text-[#9CA3AF]",
                canOpenEdit && "cursor-pointer hover:bg-[#F9FAFB]",
              )}
              onClick={() => canOpenEdit && onMemberClick(member)}
            >
              <AdminTableCell onClick={(event) => event.stopPropagation()}>
                <AdminCheckbox
                  checked={selectedIds.includes(member.id)}
                  onChange={(event) =>
                    toggleOne(member.id, event.target.checked)
                  }
                  aria-label={`${member.name} 선택`}
                />
              </AdminTableCell>
              <AdminTableCell className={cn(deleted && "text-[#9CA3AF]")}>
                {rowNumber}
              </AdminTableCell>
              <AdminTableCell
                className={cn("whitespace-nowrap font-medium", deleted && "text-[#9CA3AF]")}
              >
                {deleted ? (
                  member.name
                ) : (
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="text-left text-[#3B82F6] hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {member.name}
                  </Link>
                )}
              </AdminTableCell>
              <AdminTableCell
                className={cn("whitespace-nowrap", deleted && "text-[#9CA3AF]")}
              >
                {member.login_id}
              </AdminTableCell>
              <AdminTableCell
                className={cn("whitespace-nowrap", deleted && "text-[#9CA3AF]")}
              >
                {member.phone ?? "—"}
              </AdminTableCell>
              <AdminTableCell onClick={(event) => event.stopPropagation()}>
                <MemberCourseSummaryList courses={member.courses} />
              </AdminTableCell>
              <AdminTableCell>
                <MemberHistoryMemoCell memberId={member.id} memo={member.memo} />
              </AdminTableCell>
              <AdminTableCell className={cn("whitespace-nowrap", deleted && "text-[#9CA3AF]")}>
                {formatDate(member.joined_at)}
              </AdminTableCell>
              <AdminTableCell className={cn("whitespace-nowrap", deleted && "text-[#9CA3AF]")}>
                {formatDateTime(member.last_login_at)}
              </AdminTableCell>
              <AdminTableCell className={cn("whitespace-nowrap", deleted && "text-[#9CA3AF]")}>
                {member.manager_name ?? "—"}
              </AdminTableCell>
              {showDeleted ? (
                <AdminTableCell onClick={(event) => event.stopPropagation()}>
                  {deleted ? (
                    <MemberRestoreButton
                      onClick={() => onRestoreClick?.(member.id)}
                    />
                  ) : (
                    <span className="text-[#D1D5DB]">—</span>
                  )}
                </AdminTableCell>
              ) : null}
            </AdminTableRow>
          );
        })}
      </AdminTableBody>
    </AdminTable>
  );
}
