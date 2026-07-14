"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { EnrollmentSubNav } from "@/features/enrollments/components/enrollment-sub-nav";
import { PendingApplicantConfirmModal } from "@/features/enrollments/components/pending-applicant-confirm-modal";
import { PendingApplicantDeleteConfirmModal } from "@/features/enrollments/components/pending-applicant-delete-confirm-modal";
import { PendingApplicantRowDeleteConfirmModal } from "@/features/enrollments/components/pending-applicant-row-delete-confirm-modal";
import { PendingApplicantDetailModal } from "@/features/enrollments/components/pending-applicant-detail-modal";
import { PendingApplicantEditModal } from "@/features/enrollments/components/pending-applicant-edit-modal";
import { PendingApplicantListTable } from "@/features/enrollments/components/pending-applicant-list-table";
import { PendingApplicantListToolbar } from "@/features/enrollments/components/pending-applicant-list-toolbar";
import { PendingApplicantRegistrationModal } from "@/features/enrollments/components/pending-applicant-registration-modal";
import { buildPendingApplicantPageHref } from "@/features/enrollments/lib/pending-applicant-list-query";
import type { PendingApplicantListQuery } from "@/features/enrollments/types/pending-applicant.types";
import type {
  PendingApplicantFilterOptions,
  PendingApplicantListItem,
} from "@/features/enrollments/types/pending-applicant.types";
import type { PaginatedResult, ListQuery } from "@/lib/shared/list-query";

type PendingApplicantListViewProps = {
  result: PaginatedResult<PendingApplicantListItem>;
  query: PendingApplicantListQuery;
  filterOptions: PendingApplicantFilterOptions;
};

export function PendingApplicantListView({
  result,
  query,
  filterOptions,
}: PendingApplicantListViewProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEnrollmentId, setDetailEnrollmentId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editEnrollmentId, setEditEnrollmentId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rowDeleteOpen, setRowDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PendingApplicantListItem | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    setSelectedIds([]);
    router.refresh();
  }

  function handleDetailClick(item: PendingApplicantListItem) {
    setSuccessMessage(null);
    setDetailEnrollmentId(item.id);
    setDetailOpen(true);
  }

  function handleEditClick(itemOrId: PendingApplicantListItem | string) {
    setSuccessMessage(null);
    setEditEnrollmentId(typeof itemOrId === "string" ? itemOrId : itemOrId.id);
    setEditOpen(true);
  }

  function handleDeleteClick(item: PendingApplicantListItem) {
    setSuccessMessage(null);
    setDeleteTarget(item);
    setRowDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="신청 수강생 관리"
        description="수강을 신청했지만 아직 최종 확정되지 않은 수강생을 관리합니다."
        actions={
          <AdminButton
            type="button"
            onClick={() => {
              setSuccessMessage(null);
              setRegisterOpen(true);
            }}
          >
            <UserPlus className="size-4" />
            신청등록
          </AdminButton>
        }
      />

      <EnrollmentSubNav />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <PendingApplicantListToolbar
            query={query}
            filterOptions={filterOptions}
            selectedCount={selectedIds.length}
            onConfirmClick={() => {
              setSuccessMessage(null);
              setConfirmOpen(true);
            }}
            onDeleteClick={() => {
              setSuccessMessage(null);
              setDeleteOpen(true);
            }}
          />
          <PendingApplicantListTable
            result={result}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
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
            query={query as ListQuery}
            buildPageHref={(page) => buildPendingApplicantPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <PendingApplicantDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        enrollmentId={detailEnrollmentId}
        onEditClick={handleEditClick}
      />
      <PendingApplicantEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        enrollmentId={editEnrollmentId}
        onSuccess={handleActionSuccess}
      />
      <PendingApplicantConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        onConfirmed={handleActionSuccess}
      />
      <PendingApplicantDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        onDeleted={handleActionSuccess}
      />
      <PendingApplicantRowDeleteConfirmModal
        open={rowDeleteOpen}
        onOpenChange={(open) => {
          setRowDeleteOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
      />
      <PendingApplicantRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
