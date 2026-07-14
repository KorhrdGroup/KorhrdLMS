"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { BoardDeleteConfirmModal } from "@/features/boards/components/board-delete-confirm-modal";
import { BoardDetailModal } from "@/features/boards/components/board-detail-modal";
import { BoardFormModal } from "@/features/boards/components/board-form-modal";
import { BoardListTable } from "@/features/boards/components/board-list-table";
import { BoardListToolbar } from "@/features/boards/components/board-list-toolbar";
import { BoardReplyModal } from "@/features/boards/components/board-reply-modal";
import { BoardSubNav } from "@/features/boards/components/board-sub-nav";
import { BOARD_TYPE_LABELS } from "@/features/boards/constants";
import { buildBoardPageHref } from "@/features/boards/lib/board-list-query";
import type { BoardListItem, BoardListQuery } from "@/features/boards/types/board.types";
import type { PaginatedResult } from "@/lib/shared/list-query";
import type { BoardType } from "@/types/database.types";

type BoardListViewProps = {
  boardType: BoardType;
  result: PaginatedResult<BoardListItem>;
  query: BoardListQuery;
};

export function BoardListView({ boardType, result, query }: BoardListViewProps) {
  const router = useRouter();
  const boardLabel = BOARD_TYPE_LABELS[boardType];

  const [formOpen, setFormOpen] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPostId, setDetailPostId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyPostId, setReplyPostId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BoardListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleRegisterClick() {
    setSuccessMessage(null);
    setEditPostId(null);
    setFormOpen(true);
  }

  function handleEditClick(item: BoardListItem) {
    setSuccessMessage(null);
    setEditPostId(item.id);
    setFormOpen(true);
  }

  function handleDetailClick(item: BoardListItem) {
    setSuccessMessage(null);
    setDetailPostId(item.id);
    setDetailOpen(true);
  }

  function handleDeleteClick(item: BoardListItem) {
    setSuccessMessage(null);
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  function handleReplyClick(postId: string) {
    setReplyPostId(postId);
    setReplyOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="게시판관리"
        description={`${boardLabel} 게시글을 조회하고 관리할 수 있습니다.`}
      />

      <BoardSubNav />

      {successMessage ? (
        <p className="rounded-lg bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
          {successMessage}
        </p>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <BoardListToolbar boardType={boardType} query={query} />
            <AdminButton type="button" onClick={handleRegisterClick}>
              <Plus className="size-4" />
              글 등록
            </AdminButton>
          </div>
          <BoardListTable
            result={result}
            onDetailClick={handleDetailClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </AdminCardContent>
        <AdminCardFooter>
          <AdminListPagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            query={{
              page: query.page,
              pageSize: query.pageSize,
              search: query.search,
              field: "all",
            }}
            buildPageHref={(page) => buildBoardPageHref(boardType, page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <BoardFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        boardType={boardType}
        postId={editPostId}
        onSuccess={handleActionSuccess}
      />

      <BoardDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        postId={detailPostId}
        onReplyClick={handleReplyClick}
        onCommentAdded={handleActionSuccess}
      />

      <BoardReplyModal
        open={replyOpen}
        onOpenChange={setReplyOpen}
        postId={replyPostId}
        onSuccess={handleActionSuccess}
      />

      <BoardDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
