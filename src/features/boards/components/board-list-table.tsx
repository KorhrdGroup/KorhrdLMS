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
import { hasAttachment, truncateBoardTitle } from "@/features/boards/lib/board.utils";
import type { BoardListItem } from "@/features/boards/types/board.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type BoardListTableProps = {
  result: PaginatedResult<BoardListItem>;
  onDetailClick?: (item: BoardListItem) => void;
  onEditClick?: (item: BoardListItem) => void;
  onDeleteClick?: (item: BoardListItem) => void;
};

export function BoardListTable({
  result,
  onDetailClick,
  onEditClick,
  onDeleteClick,
}: BoardListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16 text-center">번호</AdminTableHead>
            <AdminTableHead className="w-20 text-center">공지</AdminTableHead>
            <AdminTableHead>제목</AdminTableHead>
            <AdminTableHead className="w-28">작성자</AdminTableHead>
            <AdminTableHead className="w-28">등록일</AdminTableHead>
            <AdminTableHead className="w-20 text-center">첨부</AdminTableHead>
            <AdminTableHead className="w-20 text-center">답글</AdminTableHead>
            <AdminTableHead className="w-20 text-center">댓글</AdminTableHead>
            <AdminTableHead className="w-24 text-center">보기</AdminTableHead>
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
                  {item.isNotice ? (
                    <span className="rounded-full bg-[#FEE2E2] px-2 py-1 text-xs font-medium text-[#991B1B]">
                      공지
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF]">—</span>
                  )}
                </AdminTableCell>
                <AdminTableCell className="max-w-[320px] font-medium">
                  {truncateBoardTitle(item.title)}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">{item.authorName}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDate(item.createdAt)}
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {hasAttachment(item.attachmentFileName) ? "Y" : "—"}
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {item.replyCount}
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {item.commentCount}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDetailClick?.(item)}
                  >
                    <Eye className="size-4" />
                    보기
                  </AdminButton>
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
