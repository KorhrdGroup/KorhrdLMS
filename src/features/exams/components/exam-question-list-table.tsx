"use client";

import { Eye, FilePlus, Pencil } from "lucide-react";
import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { updateExamPrintEnabledAction } from "@/features/exams/actions/exam-question.actions";
import {
  EXAM_KIND_LABELS,
  EXAM_TYPE_LABELS,
} from "@/features/exams/constants";
import type { ExamQuestionListItem } from "@/features/exams/types/exam-question.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ExamQuestionListTableProps = {
  result: PaginatedResult<ExamQuestionListItem>;
  onRegisterClick?: (item: ExamQuestionListItem) => void;
  onViewClick?: (item: ExamQuestionListItem) => void;
  onEditClick?: (item: ExamQuestionListItem) => void;
  onPrintChange?: () => void;
  onPrintError?: (message: string) => void;
};

export function ExamQuestionListTable({
  result,
  onRegisterClick,
  onViewClick,
  onEditClick,
  onPrintChange,
  onPrintError,
}: ExamQuestionListTableProps) {
  const [updatingExamId, setUpdatingExamId] = useState<string | null>(null);
  const [isUpdating, startUpdate] = useTransition();

  function handlePrintChange(item: ExamQuestionListItem, printEnabled: boolean) {
    setUpdatingExamId(item.id);

    startUpdate(async () => {
      try {
        const response = await updateExamPrintEnabledAction(item.id, printEnabled);

        if (!response.success) {
          onPrintError?.(response.message);
          return;
        }

        onPrintChange?.();
      } catch (error) {
        onPrintError?.(
          error instanceof Error ? error.message : "출력 설정 저장에 실패했습니다.",
        );
      } finally {
        setUpdatingExamId(null);
      }
    });
  }

  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        조회된 시험이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>연도</AdminTableHead>
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>시험명</AdminTableHead>
            <AdminTableHead>시험종류</AdminTableHead>
            <AdminTableHead>시험유형</AdminTableHead>
            <AdminTableHead>등록일</AdminTableHead>
            <AdminTableHead className="w-28 text-center">문제등록</AdminTableHead>
            <AdminTableHead className="w-28 text-center">문제보기</AdminTableHead>
            <AdminTableHead className="w-20 text-center">출력</AdminTableHead>
            <AdminTableHead className="w-24 text-center">수정</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item) => (
            <AdminTableRow key={item.id}>
              <AdminTableCell className="text-[#6B7280]">{item.year}</AdminTableCell>
              <AdminTableCell className="font-medium">{item.courseName}</AdminTableCell>
              <AdminTableCell>{item.name}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {EXAM_KIND_LABELS[item.examKind]}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {EXAM_TYPE_LABELS[item.examType]}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatDate(item.createdAt)}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AdminButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRegisterClick?.(item)}
                >
                  <FilePlus className="size-4" />
                  문제등록
                </AdminButton>
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AdminButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onViewClick?.(item)}
                >
                  <Eye className="size-4" />
                  문제보기
                </AdminButton>
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AdminCheckbox
                  checked={item.printEnabled}
                  disabled={isUpdating && updatingExamId === item.id}
                  aria-label={`${item.name} 출력 설정`}
                  onChange={(event) =>
                    handlePrintChange(item, event.target.checked)
                  }
                />
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEditClick?.(item)}
                >
                  <Pencil className="size-4" />
                  수정
                </AdminButton>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
