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
import { MaterialFileTypeBadge } from "@/features/learning-materials/components/material-file-type-badge";
import { MaterialStatusBadge } from "@/features/learning-materials/components/material-status-badge";
import type { MaterialListItem } from "@/features/learning-materials/types/material.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type MaterialListTableProps = {
  result: PaginatedResult<MaterialListItem>;
  onEditClick?: (material: MaterialListItem) => void;
  onDeleteClick?: (material: MaterialListItem) => void;
};

export function MaterialListTable({
  result,
  onEditClick,
  onDeleteClick,
}: MaterialListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 자료가 없습니다. 자료등록 버튼으로 새 자료를 추가하세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>제목</AdminTableHead>
            <AdminTableHead>연결 과정</AdminTableHead>
            <AdminTableHead className="w-24 text-center">자료 종류</AdminTableHead>
            <AdminTableHead className="w-32 text-center">등록일</AdminTableHead>
            <AdminTableHead className="w-20 text-center">공개 여부</AdminTableHead>
            <AdminTableHead className="w-44 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((material) => (
            <AdminTableRow key={material.id}>
              <AdminTableCell className="font-medium">{material.title}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {material.courseName}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <MaterialFileTypeBadge fileType={material.fileType} />
              </AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                {formatDate(material.createdAt)}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <MaterialStatusBadge isPublished={material.isPublished} />
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex justify-end gap-2">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditClick?.(material)}
                  >
                    <Pencil className="size-4" />
                    수정
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick?.(material)}
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
