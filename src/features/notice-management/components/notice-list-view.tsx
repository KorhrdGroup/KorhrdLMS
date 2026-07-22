"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
import { buildNoticePageHref } from "@/features/notice-management/lib/notice-list-query";
import { NoticeDeleteConfirmModal } from "@/features/notice-management/components/notice-delete-confirm-modal";
import { NoticeEditModal } from "@/features/notice-management/components/notice-edit-modal";
import { NoticeListTable } from "@/features/notice-management/components/notice-list-table";
import { NoticeListToolbar } from "@/features/notice-management/components/notice-list-toolbar";
import { NoticeRegistrationModal } from "@/features/notice-management/components/notice-registration-modal";
import type {
  NoticeListItem,
  NoticeListQuery,
} from "@/features/notice-management/types/notice.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type NoticeListViewProps = {
  result: PaginatedResult<NoticeListItem>;
  query: NoticeListQuery;
};

export function NoticeListView({ result, query }: NoticeListViewProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NoticeListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(notice: NoticeListItem) {
    setSuccessMessage(null);
    setEditNoticeId(notice.id);
    setEditOpen(true);
  }

  function handleDeleteClick(notice: NoticeListItem) {
    setSuccessMessage(null);
    setDeleteTarget(notice);
    setDeleteOpen(true);
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
          <span style={{ color: M.ink, fontWeight: 600 }}>공지사항</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>공지사항</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          사이트 및 학습강의실에 노출되는 공지사항을 등록하고 관리할 수 있습니다 · 총 {result.total}개
        </div>
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      <NoticeListToolbar
        query={query}
        onRegisterClick={() => {
          setSuccessMessage(null);
          setRegisterOpen(true);
        }}
      />

      <NoticeListTable
        result={result}
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
            search: "",
            field: "all",
          }}
          buildPageHref={(page) => buildNoticePageHref(page, query)}
          className="w-full"
        />
      </div>

      <NoticeRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={handleActionSuccess}
      />
      <NoticeEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        noticeId={editNoticeId}
        onSuccess={handleActionSuccess}
      />
      <NoticeDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        noticeId={deleteTarget?.id ?? null}
        noticeTitle={deleteTarget?.title ?? ""}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
