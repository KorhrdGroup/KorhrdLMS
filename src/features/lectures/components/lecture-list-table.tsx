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
import { LectureStatusBadge } from "@/features/lectures/components/lecture-status-badge";
import type { LectureListItem } from "@/features/lectures/types/lecture.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type LectureListTableProps = {
  result: PaginatedResult<LectureListItem>;
  onEditClick?: (lecture: LectureListItem) => void;
  onDeleteClick?: (lecture: LectureListItem) => void;
};

export function LectureListTable({
  result,
  onEditClick,
  onDeleteClick,
}: LectureListTableProps) {
  const router = useRouter();

  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 강의가 없습니다. 강의등록 버튼으로 새 강의를 추가하세요.
      </div>
    );
  }

  return (
    <AdminTable>
      <AdminTableHeader>
        <AdminTableRow className="hover:bg-transparent">
          <AdminTableHead>강의명</AdminTableHead>
          <AdminTableHead>연결 과정</AdminTableHead>
          <AdminTableHead className="w-24 text-center">총 차시 수</AdminTableHead>
          <AdminTableHead className="w-24 text-center">상태</AdminTableHead>
          <AdminTableHead className="w-32 text-center">차시관리</AdminTableHead>
          <AdminTableHead className="w-44 text-right">관리</AdminTableHead>
        </AdminTableRow>
      </AdminTableHeader>
      <AdminTableBody>
        {result.data.map((lecture) => (
          <AdminTableRow key={lecture.id}>
            <AdminTableCell className="font-medium">{lecture.title}</AdminTableCell>
            <AdminTableCell className="text-[#6B7280]">
              {lecture.courseName}
            </AdminTableCell>
            <AdminTableCell className="text-center text-[#6B7280]">
              {lecture.sessionCount}
            </AdminTableCell>
            <AdminTableCell className="text-center">
              <LectureStatusBadge isPublished={lecture.isPublished} />
            </AdminTableCell>
            <AdminTableCell className="text-center">
              <AdminButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/lectures/${lecture.id}/curriculum`)}
              >
                <ListOrdered className="size-4" />
                차시관리
              </AdminButton>
            </AdminTableCell>
            <AdminTableCell>
              <div className="flex justify-end gap-2">
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEditClick?.(lecture)}
                >
                  <Pencil className="size-4" />
                  수정
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteClick?.(lecture)}
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
  );
}
