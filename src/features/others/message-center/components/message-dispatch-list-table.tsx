"use client";

import { Eye } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { MessageSendStatusBadge } from "@/features/others/message-center/components/message-send-status-badge";
import {
  getMessageChannelLabel,
  getMessageDispatchTypeLabel,
} from "@/features/others/message-center/lib/message-dispatch.utils";
import type { MessageDispatchListItem } from "@/features/others/message-center/types/message-dispatch.types";
import { formatDateTime } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type MessageDispatchListTableProps = {
  result: PaginatedResult<MessageDispatchListItem>;
  onDetailClick?: (item: MessageDispatchListItem) => void;
};

export function MessageDispatchListTable({
  result,
  onDetailClick,
}: MessageDispatchListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        조회된 발송 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16 text-center">번호</AdminTableHead>
            <AdminTableHead className="w-28">채널</AdminTableHead>
            <AdminTableHead className="w-24">발송유형</AdminTableHead>
            <AdminTableHead>수신자/대상</AdminTableHead>
            <AdminTableHead>내용</AdminTableHead>
            <AdminTableHead className="w-24 text-center">발송상태</AdminTableHead>
            <AdminTableHead className="w-40">예약/발송시각</AdminTableHead>
            <AdminTableHead className="w-24 text-center">상세보기</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item, index) => {
            const rowNumber =
              result.total - ((result.page - 1) * result.pageSize + index);
            const eventAt = item.sentAt ?? item.scheduledAt;

            return (
              <AdminTableRow key={item.id}>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {rowNumber}
                </AdminTableCell>
                <AdminTableCell>{getMessageChannelLabel(item.channel)}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {getMessageDispatchTypeLabel(item.dispatchType)}
                </AdminTableCell>
                <AdminTableCell className="max-w-[180px] font-medium">
                  {item.recipientLabel}
                </AdminTableCell>
                <AdminTableCell className="max-w-[240px] text-[#6B7280]">
                  {item.contentPreview}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <MessageSendStatusBadge status={item.status} />
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {eventAt ? formatDateTime(eventAt) : "—"}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDetailClick?.(item)}
                  >
                    <Eye className="size-4" />
                    보기
                  </AdminButton>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
