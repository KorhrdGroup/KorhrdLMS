"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

import {
  formatDisplayPeriod,
  hasAttachment,
  truncateNoticePopupTitle,
} from "@/features/others/notice-popups/lib/notice-popup.utils";
import { M } from "@/features/courses/lib/course-design";
import type { NoticePopupListItem } from "@/features/others/notice-popups/types/notice-popup.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type NoticePopupListTableProps = {
  result: PaginatedResult<NoticePopupListItem>;
  onEditClick?: (item: NoticePopupListItem) => void;
  onDeleteClick?: (item: NoticePopupListItem) => void;
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
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const pill: CSSProperties = {
  display: "inline-flex",
  borderRadius: 999,
  padding: "2px 8px",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

export function NoticePopupListTable({
  result,
  onEditClick,
  onDeleteClick,
}: NoticePopupListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 공지팝업이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, textAlign: "center", width: 56 }}>번호</th>
            <th style={{ ...th, textAlign: "center", width: 72 }}>활성</th>
            <th style={{ ...th, textAlign: "center", width: 72 }}>공지</th>
            <th style={th}>제목</th>
            <th style={{ ...th, width: 160 }}>노출기간</th>
            <th style={{ ...th, textAlign: "center", width: 64 }}>첨부</th>
            <th style={{ ...th, textAlign: "center", width: 64 }}>순서</th>
            <th style={{ ...th, width: 112 }}>등록일</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>수정</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((item, index) => {
            const rowNumber = result.total - ((result.page - 1) * result.pageSize + index);

            return (
              <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{rowNumber}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  {item.isActive ? (
                    <span style={{ ...pill, background: "#e6f6ee", color: "#1f9254" }}>활성</span>
                  ) : (
                    <span style={{ color: M.mute }}>비활성</span>
                  )}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  {item.isNotice ? (
                    <span style={{ ...pill, background: "#fdecee", color: M.danger }}>공지</span>
                  ) : (
                    <span style={{ color: M.mute }}>—</span>
                  )}
                </td>
                <td style={{ ...td, maxWidth: 280, color: M.ink, fontWeight: 600 }}>
                  {truncateNoticePopupTitle(item.title)}
                </td>
                <td style={{ ...td, color: M.mute }}>
                  {formatDisplayPeriod(item.displayStartDate, item.displayEndDate)}
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>
                  {hasAttachment(item.attachmentFileName) ? "Y" : "—"}
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{item.sortOrder}</td>
                <td style={{ ...td, color: M.mute }}>{formatDate(item.createdAt)}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onEditClick?.(item)}
                    style={{ ...iconBtn, margin: "0 auto", border: `1px solid ${M.border}`, color: M.text }}
                  >
                    <Pencil style={{ width: 14, height: 14 }} />
                    수정
                  </button>
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onDeleteClick?.(item)}
                    style={{ ...iconBtn, margin: "0 auto", border: "1px solid #f4c9cd", color: M.danger }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                    삭제
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
