"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
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

  const description = query.deliveryStatus
    ? `배송상태 "${CERTIFICATE_DELIVERY_STATUS_LABELS[query.deliveryStatus]}" 신청건만 조회 중입니다.`
    : "학생이 프론트 자격증발급신청에서 접수한 신청 목록을 확인하고, 사진·배송정보·결제정보 확인 및 배송 여부를 관리할 수 있습니다.";

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
          자격증신청 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>발급신청</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>발급신청</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          {description} · 총 {result.total}개
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
          buildPageHref={(page) => buildCertificatePageHref(page, query)}
          className="w-full"
        />
      </div>

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
