"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { NoticePinnedBadge } from "@/features/notice-management/components/notice-pinned-badge";
import { NoticeStatusBadge } from "@/features/notice-management/components/notice-status-badge";
import type { NoticeListItem } from "@/features/notice-management/types/notice.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type NoticeListTableProps = {
  result: PaginatedResult<NoticeListItem>;
  onEditClick?: (notice: NoticeListItem) => void;
  onDeleteClick?: (notice: NoticeListItem) => void;
};

export function NoticeListTable({ result, onEditClick, onDeleteClick }: NoticeListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 공지가 없습니다. 공지등록 버튼으로 새 공지를 추가하세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>제목</AdminTableHead>
            <AdminTableHead className="w-28">작성자</AdminTableHead>
            <AdminTableHead className="w-32 text-center">등록일</AdminTableHead>
            <AdminTableHead className="w-24 text-center">상단고정</AdminTableHead>
            <AdminTableHead className="w-20 text-center">공개여부</AdminTableHead>
            <AdminTableHead className="w-20 text-center">조회수</AdminTableHead>
            <AdminTableHead className="w-44 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((notice) => (
            <AdminTableRow key={notice.id}>
              <AdminTableCell className="font-medium">{notice.title}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">{notice.authorName}</AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                {formatDate(notice.createdAt)}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <NoticePinnedBadge isPinned={notice.isPinned} />
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <NoticeStatusBadge isPublished={notice.isPublished} />
              </AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" />
                  {notice.viewCount}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex justify-end gap-2">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditClick?.(notice)}
                  >
                    <Pencil className="size-4" />
                    수정
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick?.(notice)}
                  >
                    <Trash2 className="size-4" />
                    삭제
                  </AdminButton>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
