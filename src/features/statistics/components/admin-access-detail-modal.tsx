"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { getAdminAccessLogsAction } from "@/features/statistics/actions/admin-access.actions";
import {
  formatAdminNameWithId,
  getAdminTypeLabel,
} from "@/features/statistics/lib/admin-access.utils";
import type {
  AdminAccessListItem,
  AdminAccessListQuery,
  AdminAccessLogItem,
} from "@/features/statistics/types/admin-access.types";
import { formatDateTime } from "@/lib/shared/format-date";

type AdminAccessDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminUser: AdminAccessListItem | null;
  query: AdminAccessListQuery;
};

export function AdminAccessDetailModal({
  open,
  onOpenChange,
  adminUser,
  query,
}: AdminAccessDetailModalProps) {
  const [logs, setLogs] = useState<AdminAccessLogItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();

  useEffect(() => {
    if (!open || !adminUser) {
      return;
    }

    startLoad(async () => {
      setLogs([]);
      setErrorMessage(null);

      try {
        const result = await getAdminAccessLogsAction(adminUser.id, query);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        setLogs(result.logs);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "접속 기록을 불러오지 못했습니다.",
        );
      }
    });
  }, [open, adminUser, query]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setLogs([]);
      setErrorMessage(null);
    }
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="관리자 접속기록"
      description={
        adminUser
          ? `${formatAdminNameWithId(adminUser.name, adminUser.loginId)} 관리자의 접속 기록입니다.`
          : "관리자 접속 기록을 조회합니다."
      }
      className="sm:max-w-4xl"
      footer={
        <AdminButton type="button" variant="outline" onClick={() => handleOpenChange(false)}>
          닫기
        </AdminButton>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : errorMessage ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
          조회된 접속 기록이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow className="hover:bg-transparent">
                <AdminTableHead className="w-28">관리자유형</AdminTableHead>
                <AdminTableHead>성명(ID)</AdminTableHead>
                <AdminTableHead className="w-36">접속 IP</AdminTableHead>
                <AdminTableHead className="w-40">접속시각</AdminTableHead>
                <AdminTableHead className="w-40">종료시각</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {logs.map((log) => (
                <AdminTableRow key={log.id}>
                  <AdminTableCell className="text-[#374151]">
                    {getAdminTypeLabel(log.adminType)}
                  </AdminTableCell>
                  <AdminTableCell className="font-medium">
                    {formatAdminNameWithId(log.adminName, log.adminLoginId)}
                  </AdminTableCell>
                  <AdminTableCell className="text-[#6B7280]">{log.accessIp}</AdminTableCell>
                  <AdminTableCell className="text-[#6B7280]">
                    {formatDateTime(log.loggedInAt)}
                  </AdminTableCell>
                  <AdminTableCell className="text-[#6B7280]">
                    {log.loggedOutAt ? formatDateTime(log.loggedOutAt) : "—"}
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}
    </AdminModal>
  );
}
