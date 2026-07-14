"use client";

import { Pencil, Trash2 } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import {
  formatDisplayPeriod,
  hasAttachment,
  truncateNoticePopupTitle,
} from "@/features/others/notice-popups/lib/notice-popup.utils";
import type { NoticePopupListItem } from "@/features/others/notice-popups/types/notice-popup.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type NoticePopupListTableProps = {
  result: PaginatedResult<NoticePopupListItem>;
  onEditClick?: (item: NoticePopupListItem) => void;
  onDeleteClick?: (item: NoticePopupListItem) => void;
};

export function NoticePopupListTable({
  result,
  onEditClick,
  onDeleteClick,
}: NoticePopupListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 공지팝업이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16 text-center">번호</AdminTableHead>
            <AdminTableHead className="w-20 text-center">활성</AdminTableHead>
            <AdminTableHead className="w-20 text-center">공지</AdminTableHead>
            <AdminTableHead>제목</AdminTableHead>
            <AdminTableHead className="w-40">노출기간</AdminTableHead>
            <AdminTableHead className="w-20 text-center">첨부</AdminTableHead>
            <AdminTableHead className="w-20 text-center">순서</AdminTableHead>
            <AdminTableHead className="w-28">등록일</AdminTableHead>
            <AdminTableHead className="w-24 text-center">수정</AdminTableHead>
            <AdminTableHead className="w-24 text-center">삭제</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item, index) => {
            const rowNumber =
              result.total - ((result.page - 1) * result.pageSize + index);

            return (
              <AdminTableRow key={item.id}>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {rowNumber}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  {item.isActive ? (
                    <span className="rounded-full bg-[#D1FAE5] px-2 py-1 text-xs font-medium text-[#047857]">
                      활성
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF]">비활성</span>
                  )}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  {item.isNotice ? (
                    <span className="rounded-full bg-[#FEE2E2] px-2 py-1 text-xs font-medium text-[#991B1B]">
                      공지
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF]">—</span>
                  )}
                </AdminTableCell>
                <AdminTableCell className="max-w-[280px] font-medium">
                  {truncateNoticePopupTitle(item.title)}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDisplayPeriod(item.displayStartDate, item.displayEndDate)}
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {hasAttachment(item.attachmentFileName) ? "Y" : "—"}
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {item.sortOrder}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDate(item.createdAt)}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditClick?.(item)}
                  >
                    <Pencil className="size-4" />
                    수정
                  </AdminButton>
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <AdminButton
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick?.(item)}
                  >
                    <Trash2 className="size-4" />
                    삭제
                  </AdminButton>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
