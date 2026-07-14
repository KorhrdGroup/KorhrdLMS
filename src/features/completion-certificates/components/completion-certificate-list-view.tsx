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
import { CertificateModuleSubNav } from "@/features/certificates/components/certificate-module-sub-nav";
import { CompletionCertificateCancelConfirmModal } from "@/features/completion-certificates/components/completion-certificate-cancel-confirm-modal";
import { CompletionCertificateListTable } from "@/features/completion-certificates/components/completion-certificate-list-table";
import { CompletionCertificateListToolbar } from "@/features/completion-certificates/components/completion-certificate-list-toolbar";
import { CompletionCertificatePreviewModal } from "@/features/completion-certificates/components/completion-certificate-preview-modal";
import { buildCompletionCertificatePageHref } from "@/features/completion-certificates/lib/completion-certificate-list-query";
import type {
  CompletionCertificateListItem,
  CompletionCertificateListQuery,
} from "@/features/completion-certificates/types/completion-certificate.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CompletionCertificateListViewProps = {
  result: PaginatedResult<CompletionCertificateListItem>;
  query: CompletionCertificateListQuery;
};

export function CompletionCertificateListView({
  result,
  query,
}: CompletionCertificateListViewProps) {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<CompletionCertificateListItem | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<CompletionCertificateListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    setErrorMessage(null);
    router.refresh();
  }

  function handleActionError(message: string) {
    setErrorMessage(message);
    setSuccessMessage(null);
  }

  function handlePreviewClick(item: CompletionCertificateListItem) {
    setPreviewItem(item);
    setPreviewOpen(true);
  }

  function handleCancelClick(item: CompletionCertificateListItem) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setCancelTarget(item);
    setCancelOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="수료증관리"
        description="과정을 수료한 회원의 수료증을 발급·재발급·취소하고 미리볼 수 있습니다."
      />

      <CertificateModuleSubNav />

      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs text-[#6B7280]">
        목록에는 성적관리 기준 &quot;수료&quot;로 판정된(출석·시험 합격 기준 충족,
        수강기간 종료 여부 무관) 회원만 표시됩니다. 발급상태는 이 화면에서 발급한
        수료증에 한해 &quot;발급완료&quot;로 표시되며, 학생 학습강의실 수료증
        화면과 동일한 수료번호·수료일 구조를 사용합니다.
      </div>

      {successMessage ? (
        <p className="rounded-lg bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{errorMessage}</p>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <CompletionCertificateListToolbar query={query} />
          <CompletionCertificateListTable
            result={result}
            onActionSuccess={handleActionSuccess}
            onActionError={handleActionError}
            onPreviewClick={handlePreviewClick}
            onCancelClick={handleCancelClick}
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
            buildPageHref={(page) => buildCompletionCertificatePageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <CompletionCertificatePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        item={previewItem}
      />

      <CompletionCertificateCancelConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        target={cancelTarget}
        onCanceled={handleActionSuccess}
      />
    </div>
  );
}
