"use client";

import { Eye } from "lucide-react";
import type { CSSProperties } from "react";

import { MessageSendStatusBadge } from "@/features/others/message-center/components/message-send-status-badge";
import {
  getMessageChannelLabel,
  getMessageDispatchTypeLabel,
} from "@/features/others/message-center/lib/message-dispatch.utils";
import { M } from "@/features/courses/lib/course-design";
import type { MessageDispatchListItem } from "@/features/others/message-center/types/message-dispatch.types";
import { formatDateTime } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type MessageDispatchListTableProps = {
  result: PaginatedResult<MessageDispatchListItem>;
  onDetailClick?: (item: MessageDispatchListItem) => void;
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "11px 10px",
  fontSize: 12,
  fontWeight: 500,
  color: M.mute,
  whiteSpace: "nowrap",
};
const td: CSSProperties = {
  padding: "13px 10px",
  fontSize: 13,
  color: M.body,
  verticalAlign: "middle",
};

const iconBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 600,
  background: "#fff",
  border: `1px solid ${M.border}`,
  color: M.text,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function MessageDispatchListTable({
  result,
  onDetailClick,
}: MessageDispatchListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        조회된 발송 내역이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, textAlign: "center", width: 56 }}>번호</th>
            <th style={{ ...th, width: 112 }}>채널</th>
            <th style={{ ...th, width: 96 }}>발송유형</th>
            <th style={th}>수신자/대상</th>
            <th style={th}>내용</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>발송상태</th>
            <th style={{ ...th, width: 160 }}>예약/발송시각</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>상세보기</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((item, index) => {
            const rowNumber = result.total - ((result.page - 1) * result.pageSize + index);
            const eventAt = item.sentAt ?? item.scheduledAt;

            return (
              <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{rowNumber}</td>
                <td style={td}>{getMessageChannelLabel(item.channel)}</td>
                <td style={{ ...td, color: M.mute }}>{getMessageDispatchTypeLabel(item.dispatchType)}</td>
                <td style={{ ...td, maxWidth: 180, color: M.ink, fontWeight: 600 }}>{item.recipientLabel}</td>
                <td style={{ ...td, maxWidth: 240, color: M.mute }}>{item.contentPreview}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <MessageSendStatusBadge status={item.status} />
                </td>
                <td style={{ ...td, color: M.mute }}>{eventAt ? formatDateTime(eventAt) : "—"}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onDetailClick?.(item)}
                    style={{ ...iconBtn, margin: "0 auto" }}
                  >
                    <Eye style={{ width: 14, height: 14 }} />
                    보기
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
