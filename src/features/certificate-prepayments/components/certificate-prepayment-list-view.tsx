"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
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
          결제관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>선납결제</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>선납결제</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          자격증 발급비를 미리 입금한 학생을 관리합니다 · 이후 발급신청 시 자동 연결되어 최종금액에 반영됩니다 · 총 {result.total}개
        </div>
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: "#fdecee", color: M.danger, padding: "10px 14px", fontSize: 13 }}>
          {errorMessage}
        </div>
      ) : null}

      <CertificatePrepaymentListToolbar query={query} onRegisterClick={handleRegisterClick} />

      <CertificatePrepaymentListTable
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
          buildPageHref={(page) => buildCertificatePrepaymentPageHref(page, query)}
          className="w-full"
        />
      </div>

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
