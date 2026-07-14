"use client";

import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { ExamResultPassBadge } from "@/features/exam-results/components/exam-result-pass-badge";
import { ExamResultRetakeButton } from "@/features/exam-results/components/exam-result-retake-button";
import type { ExamResultListResult } from "@/features/exam-results/types/exam-result.types";
import { formatDateTime } from "@/lib/shared/format-date";

type ExamResultListTableProps = {
  result: ExamResultListResult;
  retakeAllowedOverrides: Set<string>;
  onRetakeAllowed: (submissionId: string) => void;
};

export function ExamResultListTable({
  result,
  retakeAllowedOverrides,
  onRetakeAllowed,
}: ExamResultListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        조회된 시험 응시 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>학생명</AdminTableHead>
            <AdminTableHead>아이디</AdminTableHead>
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>시험명</AdminTableHead>
            <AdminTableHead className="w-40 text-center">응시일</AdminTableHead>
            <AdminTableHead className="w-24 text-center">점수</AdminTableHead>
            <AdminTableHead className="w-24 text-center">합격여부</AdminTableHead>
            <AdminTableHead className="w-24 text-center">응시상태</AdminTableHead>
            <AdminTableHead className="w-28 text-center">재시험 가능 여부</AdminTableHead>
            <AdminTableHead className="w-32 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item) => {
            const retakeAllowed = item.retakeAllowed || retakeAllowedOverrides.has(item.id);

            return (
              <AdminTableRow key={item.id}>
                <AdminTableCell className="font-medium">{item.member.name}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">{item.member.loginId}</AdminTableCell>
                <AdminTableCell>{item.course.name}</AdminTableCell>
                <AdminTableCell>{item.exam.name}</AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {formatDateTime(item.submittedAt)}
                </AdminTableCell>
                <AdminTableCell className="text-center font-semibold text-[#111827]">
                  {item.score} / {item.totalScore}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <ExamResultPassBadge isPassed={item.isPassed} />
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {retakeAllowed ? "재시험 대기" : "응시완료"}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <span
                    className={
                      retakeAllowed
                        ? "inline-flex rounded-md bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#3B82F6]"
                        : "inline-flex rounded-md bg-[#F1F1F1] px-2 py-0.5 text-xs font-medium text-[#919191]"
                    }
                  >
                    {retakeAllowed ? "가능" : "불가"}
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex justify-end">
                    <ExamResultRetakeButton
                      submissionId={item.id}
                      retakeAllowed={retakeAllowed}
                      onAllowed={() => onRetakeAllowed(item.id)}
                    />
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