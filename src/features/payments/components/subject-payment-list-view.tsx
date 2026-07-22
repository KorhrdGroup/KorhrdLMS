"use client";

import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
import { SubjectPaymentDetailModal } from "@/features/payments/components/subject-payment-detail-modal";
import { SubjectPaymentListTable } from "@/features/payments/components/subject-payment-list-table";
import { SubjectPaymentListToolbar } from "@/features/payments/components/subject-payment-list-toolbar";
import { buildSubjectPaymentPageHref } from "@/features/payments/lib/subject-payment-list-query";
import type {
  SubjectPaymentListItem,
  SubjectPaymentListQuery,
} from "@/features/payments/types/subject-payment.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type SubjectPaymentListViewProps = {
  result: PaginatedResult<SubjectPaymentListItem>;
  query: SubjectPaymentListQuery;
};

export function SubjectPaymentListView({
  result,
  query,
}: SubjectPaymentListViewProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPaymentId, setDetailPaymentId] = useState<string | null>(null);

  function handleDetailClick(item: SubjectPaymentListItem) {
    setDetailPaymentId(item.id);
    setDetailOpen(true);
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
          <span style={{ color: M.ink, fontWeight: 600 }}>전체결제</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>전체결제</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          과정 결제 내역을 조회하고 검색할 수 있습니다 · 총 {result.total}개
        </div>
      </div>

      <SubjectPaymentListToolbar query={query} />

      <SubjectPaymentListTable result={result} onDetailClick={handleDetailClick} />

      <div style={{ marginTop: 20 }}>
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
          buildPageHref={(page) => buildSubjectPaymentPageHref(page, query)}
          className="w-full"
        />
      </div>

      <SubjectPaymentDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        paymentId={detailPaymentId}
      />
    </div>
  );
}
