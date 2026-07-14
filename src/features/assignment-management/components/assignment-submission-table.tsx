"use client";

import { Paperclip, PenLine } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { SubmissionStatusBadge } from "@/features/assignment-management/components/submission-status-badge";
import type { AssignmentSubmission } from "@/features/assignment-management/types/assignment.types";
import { formatDateTime } from "@/lib/shared/format-date";

type AssignmentSubmissionTableProps = {
  submissions: AssignmentSubmission[];
  onGradeClick?: (submission: AssignmentSubmission) => void;
};

export function AssignmentSubmissionTable({
  submissions,
  onGradeClick,
}: AssignmentSubmissionTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#9CA3AF]">
        아직 제출한 학습자가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>제출자</AdminTableHead>
            <AdminTableHead className="w-44">제출일시</AdminTableHead>
            <AdminTableHead>첨부파일</AdminTableHead>
            <AdminTableHead className="w-24 text-center">상태</AdminTableHead>
            <AdminTableHead className="w-20 text-center">점수</AdminTableHead>
            <AdminTableHead className="w-28 text-center">채점</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {submissions.map((submission) => (
            <AdminTableRow key={submission.id}>
              <AdminTableCell>
                <p className="font-medium text-[#111827]">{submission.studentName}</p>
                <p className="text-xs text-[#9CA3AF]">{submission.studentEmail}</p>
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatDateTime(submission.submittedAt)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {submission.fileName ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Paperclip className="size-3.5" />
                    {submission.fileName}
                  </span>
                ) : (
                  "첨부파일 없음"
                )}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <SubmissionStatusBadge status={submission.status} />
              </AdminTableCell>
              <AdminTableCell className="text-center font-medium text-[#111827]">
                {submission.score ?? "—"}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onGradeClick?.(submission)}
                >
                  <PenLine className="size-4" />
                  채점
                </AdminButton>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
