"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { adminButtonVariants } from "@/components/admin/ui/admin-button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/admin-card";
import { AssignmentGradeModal } from "@/features/assignment-management/components/assignment-grade-modal";
import { AssignmentStatusBadge } from "@/features/assignment-management/components/assignment-status-badge";
import { AssignmentSubmissionTable } from "@/features/assignment-management/components/assignment-submission-table";
import type { AssignmentSubmissionSummary } from "@/features/assignment-management/types/assignment-submission.types";
import type { AssignmentSubmission } from "@/features/assignment-management/types/assignment.types";
import { formatDate } from "@/lib/shared/format-date";
import { cn } from "@/lib/utils";

type AssignmentSubmissionManageViewProps = {
  summary: AssignmentSubmissionSummary;
  submissions: AssignmentSubmission[];
};

export function AssignmentSubmissionManageView({
  summary,
  submissions,
}: AssignmentSubmissionManageViewProps) {
  const router = useRouter();
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeTarget, setGradeTarget] = useState<AssignmentSubmission | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleGradeClick(submission: AssignmentSubmission) {
    setSuccessMessage(null);
    setGradeTarget(submission);
    setGradeOpen(true);
  }

  function handleGradeSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${summary.assignmentTitle} 제출관리`}
        description="제출자 목록을 확인하고 점수·피드백을 입력해 채점할 수 있습니다."
        actions={
          <Link
            href="/admin/assignments"
            className={cn(adminButtonVariants({ variant: "outline" }))}
          >
            목록으로
          </Link>
        }
      />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardHeader className="border-0 pb-0">
          <AdminCardTitle className="text-base">과제 정보</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="grid gap-4 pt-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-[#9CA3AF]">연결 과정</p>
            <p className="text-sm font-medium text-[#111827]">{summary.courseName}</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">제출기간</p>
            <p className="text-sm font-medium text-[#111827]">
              {formatDate(summary.submissionStart)} ~ {formatDate(summary.submissionEnd)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">상태</p>
            <AssignmentStatusBadge isPublished={summary.isPublished} className="mt-0.5" />
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">제출 / 채점 현황</p>
            <p className="text-sm font-medium text-[#111827]">
              {summary.submissionCount}명 제출 / {summary.gradedCount}명 채점완료
            </p>
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <AssignmentSubmissionTable
            submissions={submissions}
            onGradeClick={handleGradeClick}
          />
        </AdminCardContent>
      </AdminCard>

      <AssignmentGradeModal
        open={gradeOpen}
        onOpenChange={(open) => {
          setGradeOpen(open);
          if (!open) {
            setGradeTarget(null);
          }
        }}
        assignmentId={summary.assignmentId}
        submission={gradeTarget}
        onSuccess={handleGradeSuccess}
      />
    </div>
  );
}
