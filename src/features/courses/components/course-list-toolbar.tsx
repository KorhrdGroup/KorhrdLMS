"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import {
  COURSE_SEARCH_FIELD_LABELS,
  type CourseSearchField,
} from "@/features/courses/constants";
import { buildCourseListQueryString } from "@/features/courses/lib/course-list-query";
import type { CourseListQuery } from "@/features/courses/services/course-list.service";

type CourseListToolbarProps = {
  query: CourseListQuery;
  onRegisterClick?: () => void;
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

export function CourseListToolbar({ query, onRegisterClick }: CourseListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as CourseSearchField;

    startTransition(() => {
      router.push(`/admin/courses${buildCourseListQueryString({ page: 1, search, field }, query)}`);
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
        <select name="field" defaultValue={query.field} style={{ ...inputBox, cursor: "pointer" }}>
          {Object.entries(COURSE_SEARCH_FIELD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input name="search" defaultValue={query.search} placeholder="검색어를 입력하세요" style={{ ...inputBox, width: 300 }} />
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
        + 과정등록
      </button>
    </div>
  );
}
