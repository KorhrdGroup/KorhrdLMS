"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo } from "react";

import { MemberCourseSummaryList } from "@/features/members/components/member-course-summary-list";
import { MemberHistoryMemoCell } from "@/features/members/components/member-history-memo-cell";
import { MemberRestoreButton } from "@/features/members/components/member-restore-button";
import { isMemberDeleted } from "@/features/members/constants";
import { M, memberGridColumns } from "@/features/members/lib/member-design";
import type { MemberListRow } from "@/features/members/types/member-list.types";
import { formatDate, formatDateTime } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type MemberListTableProps = {
  result: PaginatedResult<MemberListRow>;
  selectedIds: string[];
  showDeleted?: boolean;
  onSelectionChange: (ids: string[]) => void;
  onMemberClick?: (member: MemberListRow) => void;
  onRestoreClick?: (memberId: string) => void;
};

const HEADERS = [
  "이름",
  "아이디",
  "연락처",
  "수강과정",
  "회원정보이력",
  "가입일",
  "최근 로그인",
  "담당자",
];

export function MemberListTable({
  result,
  selectedIds,
  showDeleted = false,
  onSelectionChange,
  onMemberClick,
  onRestoreClick,
}: MemberListTableProps) {
  const pageIds = useMemo(() => result.data.map((member) => member.id), [result.data]);
  const isAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  function toggleAll(checked: boolean) {
    if (checked) {
      onSelectionChange(Array.from(new Set([...selectedIds, ...pageIds])));
      return;
    }
    onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
  }

  function toggleOne(id: string, checked: boolean) {
    if (checked) {
      onSelectionChange(Array.from(new Set([...selectedIds, id])));
      return;
    }
    onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
  }

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: memberGridColumns(showDeleted),
    alignItems: "center",
    gap: 12,
  };

  if (result.data.length === 0) {
    return (
      <div>
        <div style={{ ...gridStyle, borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}`, padding: "11px 8px", fontSize: 12, color: M.mute }}>
          <Check checked={false} onChange={() => {}} label="전체 선택" />
          <span>No</span>
          {HEADERS.map((h) => (
            <span key={h}>{h}</span>
          ))}
          {showDeleted ? <span>관리</span> : null}
        </div>
        <div style={{ padding: "60px 0", textAlign: "center", fontSize: 13, color: M.mute }}>
          검색 결과가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div style={{ ...gridStyle, borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}`, padding: "11px 8px", fontSize: 12, color: M.mute }}>
        <Check checked={isAllSelected} onChange={toggleAll} label="현재 페이지 전체 선택" />
        <span>No</span>
        {HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
        {showDeleted ? <span>관리</span> : null}
      </div>

      {/* 행 */}
      {result.data.map((member, index) => {
        const rowNumber = result.total - (result.page - 1) * result.pageSize - index;
        const deleted = isMemberDeleted(member);
        const canOpenEdit = !deleted && onMemberClick;

        return (
          <div
            key={member.id}
            onClick={() => canOpenEdit && onMemberClick?.(member)}
            style={{
              ...gridStyle,
              borderBottom: `1px solid ${M.line}`,
              padding: "13px 8px",
              fontSize: 13,
              color: deleted ? M.mute : M.text,
              background: deleted ? "#fafafa" : undefined,
              cursor: canOpenEdit ? "pointer" : undefined,
            }}
          >
            <span onClick={(e) => e.stopPropagation()}>
              <Check
                checked={selectedIds.includes(member.id)}
                onChange={(c) => toggleOne(member.id, c)}
                label={`${member.name} 선택`}
              />
            </span>
            <span style={{ color: M.mute }}>{rowNumber}</span>

            {/* 이름 */}
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {deleted ? (
                member.name
              ) : (
                <Link
                  href={`/admin/members/${member.id}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: M.ink, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  {member.name}
                </Link>
              )}
            </span>

            <span style={{ whiteSpace: "nowrap" }}>{member.login_id}</span>
            <span style={{ whiteSpace: "nowrap" }}>{member.phone ?? "—"}</span>

            <span onClick={(e) => e.stopPropagation()}>
              <MemberCourseSummaryList courses={member.courses} />
            </span>

            <span>
              <MemberHistoryMemoCell memberId={member.id} memo={member.memo} />
            </span>

            <span style={{ whiteSpace: "nowrap", color: M.body, fontSize: 12.5 }}>{formatDate(member.joined_at)}</span>
            <span style={{ whiteSpace: "nowrap", color: M.body, fontSize: 12.5 }}>{formatDateTime(member.last_login_at)}</span>
            <span style={{ whiteSpace: "nowrap", color: M.body, fontSize: 12.5 }}>{member.manager_name ?? "—"}</span>

            {showDeleted ? (
              <span onClick={(e) => e.stopPropagation()}>
                {deleted ? (
                  <MemberRestoreButton onClick={() => onRestoreClick?.(member.id)} />
                ) : (
                  <span style={{ color: "#d1d5db" }}>—</span>
                )}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** 디자인 톤에 맞춘 체크박스. */
function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      style={{ width: 14, height: 14, accentColor: M.accent, cursor: "pointer" }}
    />
  );
}
