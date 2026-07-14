"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { MEMBER_STATUS_LABELS } from "@/features/members/constants";
import { MemberDeleteConfirmModal } from "@/features/members/components/member-delete-confirm-modal";
import { MemberEditModal } from "@/features/members/components/member-edit-modal";
import { MemberListTable } from "@/features/members/components/member-list-table";
import { MemberListToolbar } from "@/features/members/components/member-list-toolbar";
import { buildMemberPageHref } from "@/features/members/lib/member-list-query";
import type { MemberListQuery } from "@/features/members/services/member-list.service";
import {
  getDeletableMemberIds,
  getRestorableMemberIds,
} from "@/features/members/services/member-restore.service";
import type { MemberListRow } from "@/features/members/types/member-list.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type MemberListViewProps = {
  result: PaginatedResult<MemberListRow>;
  query: MemberListQuery;
};

export function MemberListView({ result, query }: MemberListViewProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deletableSelectedIds = useMemo(
    () => getDeletableMemberIds(selectedIds, result.data),
    [selectedIds, result.data],
  );

  const restorableSelectedIds = useMemo(
    () => getRestorableMemberIds(selectedIds, result.data),
    [selectedIds, result.data],
  );

  function handleMemberClick(member: MemberListRow) {
    if (member.deleted_at) {
      return;
    }

    setEditMemberId(member.id);
    setEditOpen(true);
  }

  function handleDeleted() {
    setSelectedIds([]);
    router.refresh();
  }

  function handleRestoreClick(_memberId?: string) {
    // Phase 2-5: restoreMembersAction 연결 예정
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="회원 목록"
        description={
          query.status
            ? `"${MEMBER_STATUS_LABELS[query.status]}" 상태의 회원만 조회 중입니다.`
            : "전체 회원을 조회하고 검색할 수 있습니다."
        }
      />

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <MemberListToolbar
            query={query}
            selectedCount={selectedIds.length}
            deletableSelectedCount={deletableSelectedIds.length}
            restorableSelectedCount={restorableSelectedIds.length}
            onDeleteClick={() => setDeleteOpen(true)}
            onRestoreClick={() => handleRestoreClick()}
          />
          <MemberListTable
            result={result}
            selectedIds={selectedIds}
            showDeleted={query.showDeleted === true}
            onSelectionChange={setSelectedIds}
            onMemberClick={handleMemberClick}
            onRestoreClick={handleRestoreClick}
          />
        </AdminCardContent>
        <AdminCardFooter>
          <AdminListPagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            query={query}
            buildPageHref={buildMemberPageHref}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <MemberEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        memberId={editMemberId}
      />
      <MemberDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={deletableSelectedIds.length}
        selectedIds={deletableSelectedIds}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
