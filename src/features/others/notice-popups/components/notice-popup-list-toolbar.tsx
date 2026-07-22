"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import { buildNoticePopupListQueryString } from "@/features/others/notice-popups/lib/notice-popup-list-query";
import type { NoticePopupListQuery } from "@/features/others/notice-popups/types/notice-popup.types";

const inputBox: CSSProperties = {
  height: 38,
  width: "100%",
  border: `1px solid ${M.border}`,
  borderRadius: 8,
  padding: "0 14px",
  fontSize: 13,
  color: M.text,
  outline: "none",
  background: "#fff",
};

const labelText: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: M.body,
  marginBottom: 6,
};

type NoticePopupListToolbarProps = {
  query: NoticePopupListQuery;
};

export function NoticePopupListToolbar({ query }: NoticePopupListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      router.push(
        `/admin/others/notice-popups${buildNoticePopupListQueryString(
          {
            page: 1,
            search: String(formData.get("search") ?? "").trim(),
            isActive: String(formData.get("isActive") ?? "").trim() as NoticePopupListQuery["isActive"],
            isNotice: String(formData.get("isNotice") ?? "").trim() as NoticePopupListQuery["isNotice"],
          },
          query,
        )}`,
      );
    });
  }

  return (
    <form
      onSubmit={handleSearchSubmit}
      style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
    >
      <label>
        <span style={labelText}>팝업 활성</span>
        <select name="isActive" defaultValue={query.isActive} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
      </label>

      <label>
        <span style={labelText}>공지</span>
        <select name="isNotice" defaultValue={query.isNotice} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체</option>
          <option value="true">공지</option>
          <option value="false">일반</option>
        </select>
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        <span style={labelText}>검색</span>
        <input name="search" defaultValue={query.search} placeholder="제목, 내용 검색" disabled={isPending} style={inputBox} />
      </label>

      <div style={{ display: "flex", alignItems: "flex-end" }}>
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
      </div>
    </form>
  );
}
