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
import { EXAM_QUESTION_TYPE_LABELS } from "@/features/exams/constants";
import { truncateQuestionContent } from "@/features/exams/lib/exam-question-item.utils";
import type { ExamQuestionItem } from "@/features/exams/types/exam-question-item.types";

type ExamQuestionItemListTableProps = {
  questions: ExamQuestionItem[];
  onEditClick?: (item: ExamQuestionItem) => void;
  onDeleteClick?: (item: ExamQuestionItem) => void;
};

export function ExamQuestionItemListTable({
  questions,
  onEditClick,
  onDeleteClick,
}: ExamQuestionItemListTableProps) {
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 문제가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16">번호</AdminTableHead>
            <AdminTableHead>문제유형</AdminTableHead>
            <AdminTableHead>문제내용</AdminTableHead>
            <AdminTableHead className="w-24 text-center">보기개수</AdminTableHead>
            <AdminTableHead className="w-24 text-center">정답</AdminTableHead>
            <AdminTableHead className="w-20 text-center">배점</AdminTableHead>
            <AdminTableHead className="w-24 text-center">수정</AdminTableHead>
            <AdminTableHead className="w-24 text-center">삭제</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {questions.map((item) => (
            <AdminTableRow key={item.id}>
              <AdminTableCell className="text-[#6B7280]">{item.number}</AdminTableCell>
              <AdminTableCell>{EXAM_QUESTION_TYPE_LABELS[item.questionType]}</AdminTableCell>
              <AdminTableCell className="max-w-[360px]">
                {truncateQuestionContent(item.question)}
              </AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                {item.choiceCount}
              </AdminTableCell>
              <AdminTableCell className="text-center font-medium">{item.answer}</AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                {item.score}
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
              <AdminTableCell className="text-center">
                <AdminButton
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteClick?.(item)}
                >
                  <Trash2 className="size-4" />
                  삭제
                </AdminButton>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
