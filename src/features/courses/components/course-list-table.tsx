"use client";

import { Pencil, Trash2, Users } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { CourseStatusBadge } from "@/features/courses/components/course-status-badge";
import type { CourseListItem } from "@/features/courses/types/course.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CourseListTableProps = {
  result: PaginatedResult<CourseListItem>;
  onEditClick?: (course: CourseListItem) => void;
  onDeleteClick?: (course: CourseListItem) => void;
  onViewStudentsClick?: (course: CourseListItem) => void;
};

function formatPercent(value: number | null) {
  if (value == null) {
    return "—";
  }

  return `${value}%`;
}

function formatDuration(value: number | null) {
  if (value == null) {
    return "—";
  }

  return `${value}일`;
}

function formatPrice(value: number) {
  if (!value) {
    return "문의";
  }

  return `${value.toLocaleString("ko-KR")}원`;
}

export function CourseListTable({
  result,
  onEditClick,
  onDeleteClick,
  onViewStudentsClick,
}: CourseListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 과정이 없습니다. 과정등록 버튼으로 새 과정을 추가하세요.
      </div>
    );
  }

  return (
    <AdminTable>
      <AdminTableHeader>
        <AdminTableRow className="hover:bg-transparent">
          <AdminTableHead className="w-16">No</AdminTableHead>
          <AdminTableHead>과정명</AdminTableHead>
          <AdminTableHead>과정코드</AdminTableHead>
          <AdminTableHead>과정분류</AdminTableHead>
          <AdminTableHead>수강기간</AdminTableHead>
          <AdminTableHead>수강료</AdminTableHead>
          <AdminTableHead>출석률</AdminTableHead>
          <AdminTableHead>시험점수</AdminTableHead>
          <AdminTableHead>상태</AdminTableHead>
          <AdminTableHead>등록일</AdminTableHead>
          <AdminTableHead className="w-36 text-right">관리</AdminTableHead>
        </AdminTableRow>
      </AdminTableHeader>
      <AdminTableBody>
        {result.data.map((course, index) => {
          const rowNumber =
            result.total - (result.page - 1) * result.pageSize - index;

          return (
            <AdminTableRow key={course.id}>
              <AdminTableCell className="text-[#6B7280]">{rowNumber}</AdminTableCell>
              <AdminTableCell className="font-medium">{course.name}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">{course.code}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {course.categoryName ?? "—"}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatDuration(course.default_duration_days)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatPrice(course.price)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatPercent(course.completion_attendance_rate)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatPercent(course.completion_exam_score)}
              </AdminTableCell>
              <AdminTableCell>
                <CourseStatusBadge status={course.status} />
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatDate(course.created_at)}
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex justify-end gap-2">
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onViewStudentsClick?.(course)}
                  >
                    <Users className="size-4" />
                    수강생보기
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick?.(course)}
                  >
                    <Pencil className="size-4" />
                    수정
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick?.(course)}
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
  );
}
