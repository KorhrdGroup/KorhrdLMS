"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
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
    <div className="space-y-6">
      <AdminPageHeader
        title="전체결제"
        description="과정 결제 내역을 조회하고 검색할 수 있습니다."
      />

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <SubjectPaymentListToolbar query={query} />
          <SubjectPaymentListTable result={result} onDetailClick={handleDetailClick} />
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
            buildPageHref={(page) => buildSubjectPaymentPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <SubjectPaymentDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        paymentId={detailPaymentId}
      />
    </div>
  );
}
