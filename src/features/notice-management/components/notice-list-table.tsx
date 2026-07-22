"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

import { NoticePinnedBadge } from "@/features/notice-management/components/notice-pinned-badge";
import { NoticeStatusBadge } from "@/features/notice-management/components/notice-status-badge";
import { M } from "@/features/courses/lib/course-design";
import type { NoticeListItem } from "@/features/notice-management/types/notice.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type NoticeListTableProps = {
  result: PaginatedResult<NoticeListItem>;
  onEditClick?: (notice: NoticeListItem) => void;
  onDeleteClick?: (notice: NoticeListItem) => void;
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

export function NoticeListTable({ result, onEditClick, onDeleteClick }: NoticeListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 공지가 없습니다. 공지등록 버튼으로 새 공지를 추가하세요.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={th}>제목</th>
            <th style={{ ...th, width: 112 }}>작성자</th>
            <th style={{ ...th, textAlign: "center", width: 128 }}>등록일</th>
            <th style={{ ...th, textAlign: "center", width: 116 }}>상단고정</th>
            <th style={{ ...th, textAlign: "center", width: 80 }}>공개여부</th>
            <th style={{ ...th, textAlign: "center", width: 80 }}>조회수</th>
            <th style={{ ...th, textAlign: "right", width: 176 }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((notice) => (
            <tr key={notice.id} style={{ borderBottom: `1px solid ${M.line}` }}>
              <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{notice.title}</td>
              <td style={{ ...td, color: M.mute }}>{notice.authorName}</td>
              <td style={{ ...td, textAlign: "center", color: M.mute }}>{formatDate(notice.createdAt)}</td>
              <td style={{ ...td, textAlign: "center" }}>
                <NoticePinnedBadge isPinned={notice.isPinned} />
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <NoticeStatusBadge isPublished={notice.isPublished} />
              </td>
              <td style={{ ...td, textAlign: "center", color: M.mute }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Eye style={{ width: 14, height: 14 }} />
                  {notice.viewCount}
                </span>
              </td>
              <td style={{ ...td, textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => onEditClick?.(notice)}
                    style={{ ...iconBtn, border: `1px solid ${M.border}`, color: M.text }}
                  >
                    <Pencil style={{ width: 14, height: 14 }} />
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick?.(notice)}
                    style={{ ...iconBtn, border: "1px solid #f4c9cd", color: M.danger }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
