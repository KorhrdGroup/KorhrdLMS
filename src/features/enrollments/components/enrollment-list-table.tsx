"use client";

import { Pencil, Trash2 } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { EnrollmentLearningStatusBadge } from "@/features/enrollments/components/enrollment-learning-status-badge";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";
import { formatDate } from "@/lib/shared/format-date";

type EnrollmentRecordListResult = {
  data: EnrollmentRecordListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type EnrollmentListTableProps = {
  result: EnrollmentRecordListResult;
  onEditClick?: (item: EnrollmentRecordListItem) => void;
  onDeleteClick?: (item: EnrollmentRecordListItem) => void;
};

export function EnrollmentListTable({
  result,
  onEditClick,
  onDeleteClick,
}: EnrollmentListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        검색 결과가 없습니다.
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
            <AdminTableHead>담당교수</AdminTableHead>
            <AdminTableHead>수강시작일</AdminTableHead>
            <AdminTableHead>수강종료일</AdminTableHead>
            <AdminTableHead>상태</AdminTableHead>
            <AdminTableHead>진도율</AdminTableHead>
            <AdminTableHead>시험</AdminTableHead>
            <AdminTableHead>과제</AdminTableHead>
            <AdminTableHead>수료여부</AdminTableHead>
            <AdminTableHead className="w-36 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((enrollment, index) => {
            const rowNumber =
              result.total - (result.page - 1) * result.pageSize - index;

            return (
              <AdminTableRow key={enrollment.id}>
                <AdminTableCell className="text-[#6B7280]">{rowNumber}</AdminTableCell>
                <AdminTableCell className="font-medium">
                  {enrollment.member.name}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {enrollment.member.login_id}
                </AdminTableCell>
                <AdminTableCell>{enrollment.course.name}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {enrollment.instructorName}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDate(enrollment.start_date)}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDate(enrollment.end_date)}
                </AdminTableCell>
                <AdminTableCell>
                  <EnrollmentLearningStatusBadge status={enrollment.learningStatus} />
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {enrollment.progressRate}%
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {enrollment.examStatus}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {enrollment.assignmentStatus}
                </AdminTableCell>
                <AdminTableCell>
                  {enrollment.isCompleted ? (
                    <span className="inline-flex rounded-md bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#059669]">
                      수료
                    </span>
                  ) : (
                    <span className="inline-flex rounded-md bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#9CA3AF]">
                      미수료
                    </span>
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex justify-end gap-2">
                    <AdminButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick?.(enrollment)}
                    >
                      <Pencil className="size-4" />
                      수정
                    </AdminButton>
                    <AdminButton
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteClick?.(enrollment)}
                    >
                      <Trash2 className="size-4" />
                      삭제
                    </AdminButton>
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
