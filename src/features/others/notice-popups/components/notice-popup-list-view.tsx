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
    <div className="space-y-6">
      <AdminPageHeader
        title="팝업관리"
        description="공지팝업을 등록하고 노출 상태를 관리할 수 있습니다."
      />

      <OthersSubNav />

      {successMessage ? (
        <p className="rounded-lg bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
          {successMessage}
        </p>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <NoticePopupListToolbar query={query} />
            <AdminButton type="button" onClick={handleRegisterClick}>
              <Plus className="size-4" />
              등록
            </AdminButton>
          </div>
          <NoticePopupListTable
            result={result}
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
            buildPageHref={(page) => buildNoticePopupPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

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
