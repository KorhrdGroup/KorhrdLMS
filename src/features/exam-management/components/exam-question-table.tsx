"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import type { ExamQuestion } from "@/features/exam-management/types/exam.types";

function truncate(value: string, maxLength = 60) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

type ExamQuestionTableProps = {
  questions: ExamQuestion[];
  onEditClick?: (question: ExamQuestion) => void;
  onMoveClick?: (question: ExamQuestion, direction: "up" | "down") => void;
  onDeleteClick?: (question: ExamQuestion) => void;
  isMoving?: boolean;
};

export function ExamQuestionTable({
  questions,
  onEditClick,
  onMoveClick,
  onDeleteClick,
  isMoving,
}: ExamQuestionTableProps) {
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 문제가 없습니다. 문제 추가 버튼으로 첫 문제를 등록하세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16">번호</AdminTableHead>
            <AdminTableHead>문제내용</AdminTableHead>
            <AdminTableHead className="w-20 text-center">정답</AdminTableHead>
            <AdminTableHead className="w-20 text-center">배점</AdminTableHead>
            <AdminTableHead className="w-32 text-center">순서 변경</AdminTableHead>
            <AdminTableHead className="w-24 text-center">수정</AdminTableHead>
            <AdminTableHead className="w-24 text-center">삭제</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {questions.map((question, index) => (
            <AdminTableRow key={question.id}>
              <AdminTableCell className="text-[#6B7280]">{question.order}</AdminTableCell>
              <AdminTableCell className="max-w-[420px] font-medium">
                {truncate(question.question)}
              </AdminTableCell>
              <AdminTableCell className="text-center font-medium">
                {question.answer}번
              </AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                {question.score}
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex items-center justify-center gap-1">
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isMoving || index === 0}
                    aria-label="위로 이동"
                    onClick={() => onMoveClick?.(question, "up")}
                  >
                    <ArrowUp className="size-4" />
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isMoving || index === questions.length - 1}
                    aria-label="아래로 이동"
                    onClick={() => onMoveClick?.(question, "down")}
                  >
                    <ArrowDown className="size-4" />
                  </AdminButton>
                </div>
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEditClick?.(question)}
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
                  onClick={() => onDeleteClick?.(question)}
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
