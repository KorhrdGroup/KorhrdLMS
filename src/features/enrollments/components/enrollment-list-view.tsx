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
import { EnrollmentListTable } from "@/features/enrollments/components/enrollment-list-table";
import { EnrollmentListToolbar } from "@/features/enrollments/components/enrollment-list-toolbar";
import { EnrollmentRecordDeleteConfirmModal } from "@/features/enrollments/components/enrollment-record-delete-confirm-modal";
import { EnrollmentRecordEditModal } from "@/features/enrollments/components/enrollment-record-edit-modal";
import { EnrollmentRegistrationModal } from "@/features/enrollments/components/enrollment-registration-modal";
import { EnrollmentSubNav } from "@/features/enrollments/components/enrollment-sub-nav";
import { buildEnrollmentRecordPageHref } from "@/features/enrollments/lib/enrollment-record-list-query";
import type { EnrollmentRecordListQuery } from "@/features/enrollments/services/enrollment-record-list.service";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";

type EnrollmentRecordListResult = {
  data: EnrollmentRecordListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type EnrollmentListViewProps = {
  result: EnrollmentRecordListResult;
  query: EnrollmentRecordListQuery;
};

export function EnrollmentListView({ result, query }: EnrollmentListViewProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editEnrollmentId, setEditEnrollmentId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EnrollmentRecordListItem | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(item: EnrollmentRecordListItem) {
    setSuccessMessage(null);
    setEditEnrollmentId(item.id);
    setEditOpen(true);
  }

  function handleDeleteClick(item: EnrollmentRecordListItem) {
    setSuccessMessage(null);
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="수강목록"
        description="회원·과정·학습 데이터를 연결한 전체 수강 현황을 조회하고 관리할 수 있습니다."
      />

      <EnrollmentSubNav />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <EnrollmentListToolbar
            query={query}
            onRegisterClick={() => {
              setSuccessMessage(null);
              setRegisterOpen(true);
            }}
          />
          <EnrollmentListTable
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
            buildPageHref={(page) => buildEnrollmentRecordPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <EnrollmentRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={handleActionSuccess}
      />
      <EnrollmentRecordEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        enrollmentId={editEnrollmentId}
        onSuccess={handleActionSuccess}
      />
      <EnrollmentRecordDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
