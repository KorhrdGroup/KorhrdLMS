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
import { CertificatePrepaymentDeleteConfirmModal } from "@/features/certificate-prepayments/components/certificate-prepayment-delete-confirm-modal";
import { CertificatePrepaymentFormModal } from "@/features/certificate-prepayments/components/certificate-prepayment-form-modal";
import { CertificatePrepaymentListTable } from "@/features/certificate-prepayments/components/certificate-prepayment-list-table";
import { CertificatePrepaymentListToolbar } from "@/features/certificate-prepayments/components/certificate-prepayment-list-toolbar";
import { buildCertificatePrepaymentPageHref } from "@/features/certificate-prepayments/lib/certificate-prepayment-list-query";
import type { CertificatePrepaymentListQuery } from "@/features/certificate-prepayments/lib/certificate-prepayment-list-query";
import type { CertificatePrepaymentListItem } from "@/features/certificate-prepayments/types/certificate-prepayment.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CertificatePrepaymentListViewProps = {
  result: PaginatedResult<CertificatePrepaymentListItem>;
  query: CertificatePrepaymentListQuery;
};

export function CertificatePrepaymentListView({
  result,
  query,
}: CertificatePrepaymentListViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<CertificatePrepaymentListItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CertificatePrepaymentListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    setErrorMessage(null);
    router.refresh();
  }

  function handleRegisterClick() {
    setSuccessMessage(null);
    setErrorMessage(null);
    setFormTarget(null);
    setFormOpen(true);
  }

  function handleEditClick(item: CertificatePrepaymentListItem) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setFormTarget(item);
    setFormOpen(true);
  }

  function handleDeleteClick(item: CertificatePrepaymentListItem) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="선납결제"
        description="자격증 발급비를 미리 결제(입금 확인)한 학생을 관리합니다. 등록된 선납결제는 해당 학생이 이후 자격증발급신청을 제출할 때 자동으로 연결되어 최종결제금액에 반영됩니다."
      />

      {successMessage ? (
        <p className="rounded-lg bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
          {errorMessage}
        </p>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <CertificatePrepaymentListToolbar query={query} onRegisterClick={handleRegisterClick} />
          <CertificatePrepaymentListTable
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
            buildPageHref={(page) => buildCertificatePrepaymentPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <CertificatePrepaymentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        target={formTarget}
        onSaved={handleActionSuccess}
      />

      <CertificatePrepaymentDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
        onError={(message) => {
          setSuccessMessage(null);
          setErrorMessage(message);
        }}
      />
    </div>
  );
}
