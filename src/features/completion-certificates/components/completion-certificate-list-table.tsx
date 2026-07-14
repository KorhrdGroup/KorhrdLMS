"use client";

import { Eye, RotateCw, Stamp, XCircle } from "lucide-react";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import {
  issueCompletionCertificateAction,
  reissueCompletionCertificateAction,
} from "@/features/completion-certificates/actions/completion-certificate.actions";
import { CertificateIssuanceStatusBadge } from "@/features/completion-certificates/components/certificate-issuance-status-badge";
import type { CompletionCertificateListItem } from "@/features/completion-certificates/types/completion-certificate.types";
import { formatDate, formatDateTime } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CompletionCertificateListTableProps = {
  result: PaginatedResult<CompletionCertificateListItem>;
  onActionSuccess: (message: string) => void;
  onActionError: (message: string) => void;
  onPreviewClick: (item: CompletionCertificateListItem) => void;
  onCancelClick: (item: CompletionCertificateListItem) => void;
};

export function CompletionCertificateListTable({
  result,
  onActionSuccess,
  onActionError,
  onPreviewClick,
  onCancelClick,
}: CompletionCertificateListTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleIssueClick(item: CompletionCertificateListItem) {
    startTransition(async () => {
      const response = await issueCompletionCertificateAction(item.enrollmentId);
      if (!response.success) {
        onActionError(response.message);
        return;
      }
      onActionSuccess(response.message);
    });
  }

  function handleReissueClick(item: CompletionCertificateListItem) {
    startTransition(async () => {
      const response = await reissueCompletionCertificateAction(item.enrollmentId);
      if (!response.success) {
        onActionError(response.message);
        return;
      }
      onActionSuccess(response.message);
    });
  }

  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        수료 조건을 충족한 대상이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-14">No</AdminTableHead>
            <AdminTableHead>회원명</AdminTableHead>
            <AdminTableHead>아이디</AdminTableHead>
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>수료일</AdminTableHead>
            <AdminTableHead>수료번호</AdminTableHead>
            <AdminTableHead>발급상태</AdminTableHead>
            <AdminTableHead>발급일</AdminTableHead>
            <AdminTableHead>재발급횟수</AdminTableHead>
            <AdminTableHead className="w-72 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item, index) => {
            const rowNumber = result.total - (result.page - 1) * result.pageSize - index;
            const isIssued = item.issuanceStatus === "issued";

            return (
              <AdminTableRow key={item.enrollmentId}>
                <AdminTableCell className="text-[#6B7280]">{rowNumber}</AdminTableCell>
                <AdminTableCell className="font-medium">{item.member.name}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">{item.member.loginId}</AdminTableCell>
                <AdminTableCell>{item.course.name}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDate(item.completionDate)}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {item.certificateNumber ?? "—"}
                </AdminTableCell>
                <AdminTableCell>
                  <CertificateIssuanceStatusBadge status={item.issuanceStatus} />
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDateTime(item.issuedAt)}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">{item.reissueCount}회</AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {isIssued ? (
                      <>
                        <AdminButton
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => onPreviewClick(item)}
                        >
                          <Eye className="size-4" />
                          미리보기
                        </AdminButton>
                        <AdminButton
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleReissueClick(item)}
                        >
                          <RotateCw className="size-4" />
                          재발급
                        </AdminButton>
                        <AdminButton
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-[#EF4444] hover:bg-[#FEF2F2]"
                          disabled={isPending}
                          onClick={() => onCancelClick(item)}
                        >
                          <XCircle className="size-4" />
                          발급취소
                        </AdminButton>
                      </>
                    ) : (
                      <AdminButton
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleIssueClick(item)}
                      >
                        <Stamp className="size-4" />
                        발급
                      </AdminButton>
                    )}
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
