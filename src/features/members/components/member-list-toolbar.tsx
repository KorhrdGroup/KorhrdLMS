"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/members/lib/member-design";
import {
  MEMBER_SEARCH_FIELD_LABELS,
  type MemberSearchField,
} from "@/features/members/constants";
import { buildListQueryString, type ListQuery } from "@/lib/shared/list-query";

type MemberListToolbarProps = {
  query: ListQuery;
  selectedCount: number;
  deletableSelectedCount: number;
  restorableSelectedCount: number;
  onDeleteClick?: () => void;
  onRestoreClick?: () => void;
};

const inputBox: CSSProperties = {
  height: 38,
  border: `1px solid ${M.border}`,
  borderRadius: 8,
  padding: "0 14px",
  fontSize: 13,
  color: M.text,
  outline: "none",
  background: "#fff",
};

export function MemberListToolbar({
  query,
  selectedCount,
  deletableSelectedCount,
  restorableSelectedCount,
  onDeleteClick,
  onRestoreClick,
}: MemberListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as MemberSearchField;

    startTransition(() => {
      router.push(`/admin/members${buildListQueryString({ page: 1, search, field }, query)}`);
    });
  }

  function handleShowDeletedToggle(checked: boolean) {
    startTransition(() => {
      router.push(`/admin/members${buildListQueryString({ page: 1, showDeleted: checked }, query)}`);
    });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          paddingBottom: 16,
        }}
      >
        {/* 검색 */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select name="field" defaultValue={query.field} style={{ ...inputBox, cursor: "pointer" }}>
            {Object.entries(MEMBER_SEARCH_FIELD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            name="search"
            defaultValue={query.search}
            placeholder="검색어를 입력하세요"
            style={{ ...inputBox, width: 300 }}
          />
          <button
            type="submit"
            disabled={isPending}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 8,
              background: M.ink,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: isPending ? "wait" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            검색
          </button>
        </form>

        {/* 액션 */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: M.body, marginRight: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={query.showDeleted === true}
              onChange={(e) => handleShowDeletedToggle(e.target.checked)}
              aria-label="삭제회원 보기"
              style={{ width: 14, height: 14, accentColor: M.accent }}
            />
            삭제회원 보기
          </label>

          <ActionButton
            label="선택 삭제"
            onClick={onDeleteClick}
            disabled={deletableSelectedCount === 0}
            variant="outline"
          />
          {query.showDeleted ? (
            <ActionButton
              label="선택 복구"
              onClick={onRestoreClick}
              disabled={restorableSelectedCount === 0}
              variant="outline"
            />
          ) : null}
          <ActionButton label="Excel 다운로드" disabled title="준비 중" variant="outline" />
          <ActionButton label="문자발송" disabled title="준비 중" variant="accent" />
        </div>
      </div>

      {selectedCount > 0 ? (
        <p style={{ fontSize: 13, color: M.accent, marginTop: 4 }}>{selectedCount}명 선택됨</p>
      ) : null}
      {query.showDeleted ? (
        <p style={{ fontSize: 13, color: M.body, marginTop: 4 }}>
          휴지통에 있는 삭제 회원을 포함해 표시합니다. 삭제 회원은 회색으로 구분됩니다.
        </p>
      ) : null}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  title,
  variant,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  variant: "outline" | "accent";
}) {
  const base: CSSProperties = {
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: variant === "accent" ? 600 : 400,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
  const style: CSSProperties =
    variant === "accent"
      ? { ...base, background: M.accent, color: "#fff", border: "none" }
      : { ...base, background: "#fff", color: M.text, border: `1px solid ${M.border}` };

  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} style={style}>
      {label}
    </button>
  );
}
