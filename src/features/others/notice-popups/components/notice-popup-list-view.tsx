"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
import { OthersSubNav } from "@/features/others/components/others-sub-nav";
import { NoticePopupDeleteConfirmModal } from "@/features/others/notice-popups/components/notice-popup-delete-confirm-modal";
import { NoticePopupFormModal } from "@/features/others/notice-popups/components/notice-popup-form-modal";
import { NoticePopupListTable } from "@/features/others/notice-popups/components/notice-popup-list-table";
import { NoticePopupListToolbar } from "@/features/others/notice-popups/components/notice-popup-list-toolbar";
import { buildNoticePopupPageHref } from "@/features/others/notice-popups/lib/notice-popup-list-query";
import type {
  NoticePopupListItem,
  NoticePopupListQuery,
} from "@/features/others/notice-popups/types/notice-popup.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type NoticePopupListViewProps = {
  result: PaginatedResult<NoticePopupListItem>;
  query: NoticePopupListQuery;
};

export function NoticePopupListView({ result, query }: NoticePopupListViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editPopupId, setEditPopupId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NoticePopupListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleRegisterClick() {
    setEditPopupId(null);
    setFormOpen(true);
  }

  function handleEditClick(item: NoticePopupListItem) {
    setEditPopupId(item.id);
    setFormOpen(true);
  }

  function handleDeleteClick(item: NoticePopupListItem) {
    setDeleteTarget(item);
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
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          운영관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>팝업관리</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>팝업관리</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          공지팝업을 등록하고 노출 상태를 관리할 수 있습니다 · 총 {result.total}개
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <OthersSubNav />
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          paddingBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <NoticePopupListToolbar query={query} />
        </div>
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
          등록
        </button>
      </div>

      <NoticePopupListTable
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
            search: query.search,
            field: "all",
          }}
          buildPageHref={(page) => buildNoticePopupPageHref(page, query)}
          className="w-full"
        />
      </div>

      <NoticePopupFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        popupId={editPopupId}
        onSuccess={handleActionSuccess}
      />

      <NoticePopupDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
