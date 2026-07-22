"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import {
  NOTICE_PINNED_FILTER_LABELS,
  NOTICE_PUBLISH_FILTER_LABELS,
} from "@/features/notice-management/constants";
import { buildNoticeListQueryString } from "@/features/notice-management/lib/notice-list-query";
import type { NoticeListQuery } from "@/features/notice-management/types/notice.types";

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

type NoticeListToolbarProps = {
  query: NoticeListQuery;
  onRegisterClick?: () => void;
};

export function NoticeListToolbar({ query, onRegisterClick }: NoticeListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const pinned = String(formData.get("pinned") ?? "") as NoticeListQuery["pinned"];
    const publish = String(formData.get("publish") ?? "") as NoticeListQuery["publish"];

    startTransition(() => {
      router.push(
        `/admin/notices${buildNoticeListQueryString(
          { page: 1, search, pinned, publish },
          query,
        )}`,
      );
    });
  }

  return (
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
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select name="pinned" defaultValue={query.pinned} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체 고정상태</option>
          {Object.entries(NOTICE_PINNED_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select name="publish" defaultValue={query.publish} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체 상태</option>
          {Object.entries(NOTICE_PUBLISH_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input name="search" defaultValue={query.search} placeholder="제목으로 검색" style={{ ...inputBox, width: 240 }} />

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

      <button
        type="button"
        onClick={onRegisterClick}
        style={{
          height: 38,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "0 18px",
          borderRadius: 8,
          background: M.accent,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
      >
        <Plus style={{ width: 16, height: 16 }} />
        공지등록
      </button>
    </div>
  );
}
