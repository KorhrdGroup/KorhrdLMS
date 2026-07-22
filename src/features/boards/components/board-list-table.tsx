"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

import { hasAttachment, truncateBoardTitle } from "@/features/boards/lib/board.utils";
import { M } from "@/features/courses/lib/course-design";
import type { BoardListItem } from "@/features/boards/types/board.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type BoardListTableProps = {
  result: PaginatedResult<BoardListItem>;
  onDetailClick?: (item: BoardListItem) => void;
  onEditClick?: (item: BoardListItem) => void;
  onDeleteClick?: (item: BoardListItem) => void;
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

export function BoardListTable({
  result,
  onDetailClick,
  onEditClick,
  onDeleteClick,
}: BoardListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 게시글이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, textAlign: "center", width: 56 }}>번호</th>
            <th style={{ ...th, textAlign: "center", width: 72 }}>공지</th>
            <th style={th}>제목</th>
            <th style={{ ...th, width: 112 }}>작성자</th>
            <th style={{ ...th, width: 112 }}>등록일</th>
            <th style={{ ...th, textAlign: "center", width: 64 }}>첨부</th>
            <th style={{ ...th, textAlign: "center", width: 64 }}>답글</th>
            <th style={{ ...th, textAlign: "center", width: 64 }}>댓글</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>보기</th>
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
                  {item.isNotice ? (
                    <span
                      style={{
                        display: "inline-flex",
                        borderRadius: 999,
                        padding: "2px 8px",
                        fontSize: 12,
                        fontWeight: 600,
                        background: "#fdecee",
                        color: M.danger,
                        whiteSpace: "nowrap",
                      }}
                    >
                      공지
                    </span>
                  ) : (
                    <span style={{ color: M.mute }}>—</span>
                  )}
                </td>
                <td style={{ ...td, maxWidth: 320, color: M.ink, fontWeight: 600 }}>
                  {truncateBoardTitle(item.title)}
                </td>
                <td style={{ ...td, color: M.mute }}>{item.authorName}</td>
                <td style={{ ...td, color: M.mute }}>{formatDate(item.createdAt)}</td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>
                  {hasAttachment(item.attachmentFileName) ? "Y" : "—"}
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{item.replyCount}</td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{item.commentCount}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onDetailClick?.(item)}
                    style={{ ...iconBtn, margin: "0 auto", border: `1px solid ${M.border}`, color: M.text }}
                  >
                    <Eye style={{ width: 14, height: 14 }} />
                    보기
                  </button>
                </td>
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
