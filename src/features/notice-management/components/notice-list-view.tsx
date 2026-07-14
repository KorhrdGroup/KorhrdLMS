"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
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
    <div className="space-y-6">
      <AdminPageHeader
        title="공지사항"
        description="사이트 및 학습강의실에 노출되는 공지사항을 등록하고 관리할 수 있습니다."
      />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
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
              search: "",
              field: "all",
            }}
            buildPageHref={(page) => buildNoticePageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

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
