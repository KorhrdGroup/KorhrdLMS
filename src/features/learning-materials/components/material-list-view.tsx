"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { buildMaterialPageHref } from "@/features/learning-materials/lib/material-list-query";
import { MaterialDeleteConfirmModal } from "@/features/learning-materials/components/material-delete-confirm-modal";
import { MaterialEditModal } from "@/features/learning-materials/components/material-edit-modal";
import { MaterialListTable } from "@/features/learning-materials/components/material-list-table";
import { MaterialListToolbar } from "@/features/learning-materials/components/material-list-toolbar";
import { MaterialRegistrationModal } from "@/features/learning-materials/components/material-registration-modal";
import type {
  MaterialFilterOptions,
  MaterialListItem,
  MaterialListQuery,
} from "@/features/learning-materials/types/material.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type MaterialListViewProps = {
  result: PaginatedResult<MaterialListItem>;
  query: MaterialListQuery;
  filterOptions: MaterialFilterOptions;
};

export function MaterialListView({ result, query, filterOptions }: MaterialListViewProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editMaterialId, setEditMaterialId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MaterialListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(material: MaterialListItem) {
    setSuccessMessage(null);
    setEditMaterialId(material.id);
    setEditOpen(true);
  }

  function handleDeleteClick(material: MaterialListItem) {
    setSuccessMessage(null);
    setDeleteTarget(material);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="자료실"
        description="과정에 연결된 학습자료를 등록하고 학생 자료실 노출 여부를 관리할 수 있습니다."
      />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <MaterialListToolbar
            query={query}
            filterOptions={filterOptions}
            onRegisterClick={() => {
              setSuccessMessage(null);
              setRegisterOpen(true);
            }}
          />
          <MaterialListTable
            result={result}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </AdminCardContent>
        <AdminCardFooter>
          <AdminListPagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            query={{
              page: query.page,
              pageSize: query.pageSize,
              search: "",
              field: "all",
            }}
            buildPageHref={(page) => buildMaterialPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <MaterialRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <MaterialEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        materialId={editMaterialId}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <MaterialDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        materialId={deleteTarget?.id ?? null}
        materialTitle={deleteTarget?.title ?? ""}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
