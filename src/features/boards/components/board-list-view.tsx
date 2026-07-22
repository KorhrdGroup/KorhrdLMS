"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
import { BoardDeleteConfirmModal } from "@/features/boards/components/board-delete-confirm-modal";
import { BoardDetailModal } from "@/features/boards/components/board-detail-modal";
import { BoardFormModal } from "@/features/boards/components/board-form-modal";
import { BoardListTable } from "@/features/boards/components/board-list-table";
import { BoardListToolbar } from "@/features/boards/components/board-list-toolbar";
import { BoardReplyModal } from "@/features/boards/components/board-reply-modal";
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
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          게시판관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>{boardLabel}</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>{boardLabel}</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          {boardLabel} 게시글을 조회하고 관리할 수 있습니다 · 총 {result.total}개
        </div>
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          paddingBottom: 16,
        }}
      >
        <BoardListToolbar boardType={boardType} query={query} />
        <button
          type="button"
          onClick={handleRegisterClick}
          style={{
            height: 38,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0 18px",
            borderRadius: 8,
            background: M.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          글 등록
        </button>
      </div>

      <BoardListTable
        result={result}
        onDetailClick={handleDetailClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <div style={{ marginTop: 20 }}>
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
      </div>

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
