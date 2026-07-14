"use client";

import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { AssignmentStatusBadge } from "@/features/assignment-management/components/assignment-status-badge";
import type { AssignmentListItem } from "@/features/assignment-management/types/assignment.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type AssignmentListTableProps = {
  result: PaginatedResult<AssignmentListItem>;
  onEditClick?: (assignment: AssignmentListItem) => void;
  onDeleteClick?: (assignment: AssignmentListItem) => void;
};

export function AssignmentListTable({
  result,
  onEditClick,
  onDeleteClick,
}: AssignmentListTableProps) {
  const router = useRouter();

  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 과제가 없습니다. 과제등록 버튼으로 새 과제를 추가하세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>과제명</AdminTableHead>
            <AdminTableHead>연결 과정</AdminTableHead>
            <AdminTableHead className="w-48 text-center">제출기간</AdminTableHead>
            <AdminTableHead className="w-20 text-center">상태</AdminTableHead>
            <AdminTableHead className="w-36 text-center">제출관리</AdminTableHead>
            <AdminTableHead className="w-44 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((assignment) => (
            <AdminTableRow key={assignment.id}>
              <AdminTableCell className="font-medium">{assignment.title}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {assignment.courseName}
              </AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                {formatDate(assignment.submissionStart)} ~{" "}
                {formatDate(assignment.submissionEnd)}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AssignmentStatusBadge isPublished={assignment.isPublished} />
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AdminButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/assignments/${assignment.id}/submissions`)}
                >
                  <ClipboardList className="size-4" />
                  제출자 {assignment.submissionCount}명
                </AdminButton>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex justify-end gap-2">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditClick?.(assignment)}
                  >
                    <Pencil className="size-4" />
                    수정
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick?.(assignment)}
                  >
                    <Trash2 className="size-4" />
                    삭제
                  </AdminButton>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
