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
import { CertificateDeleteConfirmModal } from "@/features/certificates/components/certificate-delete-confirm-modal";
import { CertificateDetailModal } from "@/features/certificates/components/certificate-detail-modal";
import { CertificateListTable } from "@/features/certificates/components/certificate-list-table";
import { CertificateListToolbar } from "@/features/certificates/components/certificate-list-toolbar";
import { CERTIFICATE_DELIVERY_STATUS_LABELS } from "@/features/certificates/constants";
import { buildCertificatePageHref } from "@/features/certificates/lib/certificate-list-query";
import type {
  CertificateListItem,
  CertificateListQuery,
} from "@/features/certificates/types/certificate.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CertificateListViewProps = {
  result: PaginatedResult<CertificateListItem>;
  query: CertificateListQuery;
};

export function CertificateListView({ result, query }: CertificateListViewProps) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailApplicationId, setDetailApplicationId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CertificateListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    setErrorMessage(null);
    router.refresh();
  }

  function handleDetailClick(item: CertificateListItem) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setDetailApplicationId(item.id);
    setDetailOpen(true);
  }

  function handleDeleteClick(item: CertificateListItem) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="발급신청"
        description={
          query.deliveryStatus
            ? `배송상태 "${CERTIFICATE_DELIVERY_STATUS_LABELS[query.deliveryStatus]}" 신청건만 조회 중입니다.`
            : "학생이 프론트 자격증발급신청에서 접수한 신청 목록을 확인하고, 사진·배송정보·결제정보 확인 및 배송 여부를 관리할 수 있습니다."
        }
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
          <CertificateListToolbar
            query={query}
            onExportError={(message) => {
              setSuccessMessage(null);
              setErrorMessage(message);
            }}
          />
          <CertificateListTable
            result={result}
            onDetailClick={handleDetailClick}
            onDeleteClick={handleDeleteClick}
            onDeliveryError={(message) => {
              setSuccessMessage(null);
              setErrorMessage(message);
            }}
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
            buildPageHref={(page) => buildCertificatePageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <CertificateDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        applicationId={detailApplicationId}
        onUpdated={handleActionSuccess}
      />

      <CertificateDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
