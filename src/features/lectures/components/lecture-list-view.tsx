"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
import { LectureDeleteConfirmModal } from "@/features/lectures/components/lecture-delete-confirm-modal";
import { LectureEditModal } from "@/features/lectures/components/lecture-edit-modal";
import { LectureListTable } from "@/features/lectures/components/lecture-list-table";
import { LectureListToolbar } from "@/features/lectures/components/lecture-list-toolbar";
import { LectureRegistrationModal } from "@/features/lectures/components/lecture-registration-modal";
import { buildLecturePageHref } from "@/features/lectures/lib/lecture-list-query";
import type {
  LectureFilterOptions,
  LectureListItem,
  LectureListQuery,
} from "@/features/lectures/types/lecture.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type LectureListViewProps = {
  result: PaginatedResult<LectureListItem>;
  query: LectureListQuery;
  filterOptions: LectureFilterOptions;
};

export function LectureListView({
  result,
  query,
  filterOptions,
}: LectureListViewProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLectureId, setEditLectureId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LectureListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(lecture: LectureListItem) {
    setSuccessMessage(null);
    setEditLectureId(lecture.id);
    setEditOpen(true);
  }

  function handleDeleteClick(lecture: LectureListItem) {
    setSuccessMessage(null);
    setDeleteTarget(lecture);
    setDeleteOpen(true);
  }

  return (
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          과정관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>차시관리</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>차시관리</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          과정에 연결된 강의를 등록하고 차시를 관리할 수 있습니다 · 총 {result.total}개
        </div>
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      <LectureListToolbar
        query={query}
        filterOptions={filterOptions}
        onRegisterClick={() => {
          setSuccessMessage(null);
          setRegisterOpen(true);
        }}
      />

      <LectureListTable
        result={result}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <div style={{ marginTop: 20 }}>
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
          buildPageHref={(page) => buildLecturePageHref(page, query)}
          className="w-full"
        />
      </div>

      <LectureRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <LectureEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        lectureId={editLectureId}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <LectureDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        lectureId={deleteTarget?.id ?? null}
        lectureTitle={deleteTarget?.title ?? ""}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
