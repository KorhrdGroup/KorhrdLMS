"use client";

import { ListOrdered, Pencil, Trash2 } from "lucide-react";
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
import { EXAM_KIND_LABELS } from "@/features/exam-management/constants";
import { ExamStatusBadge } from "@/features/exam-management/components/exam-status-badge";
import type { ExamListItem } from "@/features/exam-management/types/exam.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ExamListTableProps = {
  result: PaginatedResult<ExamListItem>;
  onEditClick?: (exam: ExamListItem) => void;
  onDeleteClick?: (exam: ExamListItem) => void;
};

export function ExamListTable({ result, onEditClick, onDeleteClick }: ExamListTableProps) {
  const router = useRouter();

  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 시험이 없습니다. 시험등록 버튼으로 새 시험을 추가하세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>시험명</AdminTableHead>
            <AdminTableHead>연결 과정</AdminTableHead>
            <AdminTableHead className="w-24 text-center">시험종류</AdminTableHead>
            <AdminTableHead className="w-20 text-center">상태</AdminTableHead>
            <AdminTableHead className="w-32 text-center">문제관리</AdminTableHead>
            <AdminTableHead className="w-44 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((exam) => (
            <AdminTableRow key={exam.id}>
              <AdminTableCell className="font-medium">{exam.title}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">{exam.courseName}</AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                {EXAM_KIND_LABELS[exam.examKind]}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <ExamStatusBadge isPublished={exam.isPublished} />
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AdminButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/exams/${exam.id}/questions`)}
                >
                  <ListOrdered className="size-4" />
                  문제관리 ({exam.questionCount})
                </AdminButton>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex justify-end gap-2">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditClick?.(exam)}
                  >
                    <Pencil className="size-4" />
                    수정
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick?.(exam)}
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
