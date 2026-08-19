"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import {
  bumpCertificateApplicationAction,
  updateCertificateApplicationAction,
} from "@/features/certificates/actions/certificate.actions";
import { M } from "@/features/courses/lib/course-design";
import { CertificateDeleteConfirmModal } from "@/features/certificates/components/certificate-delete-confirm-modal";
import { CertificateDetailModal } from "@/features/certificates/components/certificate-detail-modal";
import { CertificateListTable } from "@/features/certificates/components/certificate-list-table";
import { CertificateListToolbar } from "@/features/certificates/components/certificate-list-toolbar";
import { CERTIFICATE_DELIVERY_STATUS_LABELS } from "@/features/certificates/constants";
import {
  buildCertificateListQueryString,
  buildCertificatePageHref,
} from "@/features/certificates/lib/certificate-list-query";
import type {
  CertificateListItem,
  CertificateListQuery,
} from "@/features/certificates/types/certificate.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CertificateListViewProps = {
  result: PaginatedResult<CertificateListItem>;
  query: CertificateListQuery;
  /** 필터 드롭다운용 자격증명 목록 */
  certNames: string[];
};

export function CertificateListView({ result, query, certNames }: CertificateListViewProps) {
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

  /** 목록에서 바로 상태 처리 — 대기중 체크 → 입금완료, 발송예정 → 발송완료 */
  async function handleQuickUpdate(
    item: CertificateListItem,
    input: Parameters<typeof updateCertificateApplicationAction>[1],
    doneMessage: string,
  ) {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const result = await updateCertificateApplicationAction(item.id, input);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      handleActionSuccess(`${item.applicantName} — ${doneMessage}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "처리에 실패했습니다.");
    }
  }

  /** 결제대기 건 끌어올리기 — 신청일을 오늘로 바꿔 맨 위로 (본사 2주 미확인 대응) */
  async function handleBump(item: CertificateListItem) {
    if (
      !window.confirm(
        `${item.applicantName} 님의 신청일을 오늘 날짜로 바꾸고 목록 맨 위로 끌어올릴까요?`,
      )
    ) {
      return;
    }
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const result = await bumpCertificateApplicationAction(item.id);
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      handleActionSuccess(`${item.applicantName} — ${result.message}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "처리에 실패했습니다.");
    }
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

      {/* 분류 — 본사가 신청일 2주 지난 건은 확인하지 않아, 결제대기 학생만 모아
          끌어올리기(신청일 갱신)로 처리할 수 있게 나눠 봅니다 (2026-08-19) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { value: "" as const, label: "전체 신청자" },
          { value: "unpaid" as const, label: "결제대기 학생" },
        ].map((tab) => {
          const active = (query.paymentFilter || "") === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() =>
                router.push(
                  `/admin/certificates/applications${buildCertificateListQueryString(
                    { paymentFilter: tab.value, page: 1 },
                    query,
                  )}`,
                )
              }
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${active ? "#3182F6" : M.border}`,
                background: active ? "#EAF2FE" : "#fff",
                color: active ? "#3182F6" : M.body,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <CertificateListToolbar
        query={query}
        certNames={certNames}
        onExportError={(message) => {
          setSuccessMessage(null);
          setErrorMessage(message);
        }}
      />

      <CertificateListTable
        result={result}
        onDetailClick={handleDetailClick}
        onDeleteClick={handleDeleteClick}
        onBumpClick={handleBump}
        onTogglePaid={(item, paid) =>
          handleQuickUpdate(
            item,
            { paymentStatus: paid ? "paid" : "unpaid" },
            paid ? "입금완료 처리했습니다." : "대기중으로 되돌렸습니다.",
          )
        }
        onToggleShipped={(item, shipped) =>
          handleQuickUpdate(
            item,
            { deliveryStatus: shipped ? "shipped" : "pending" },
            shipped ? "발송완료 처리했습니다." : "발송예정으로 되돌렸습니다.",
          )
        }
        onToggleNoPhoto={(item, noPhoto) =>
          handleQuickUpdate(
            item,
            { issueWithoutPhoto: noPhoto },
            noPhoto ? "사진 없이 발급으로 표시했습니다." : "사진 없이 발급 표시를 해제했습니다.",
          )
        }
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
