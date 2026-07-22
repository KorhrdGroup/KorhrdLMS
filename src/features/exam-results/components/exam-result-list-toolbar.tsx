"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import {
  EXAM_RESULT_PASS_FILTER_LABELS,
  EXAM_RESULT_SEARCH_FIELD_LABELS,
} from "@/features/exam-results/constants";
import { buildExamResultListQueryString } from "@/features/exam-results/lib/exam-result-list-query";
import type {
  ExamResultListQuery,
  ExamResultPassFilter,
  ExamResultSearchField,
} from "@/features/exam-results/types/exam-result.types";

type ExamResultListToolbarProps = {
  query: ExamResultListQuery;
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

export function ExamResultListToolbar({ query }: ExamResultListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as ExamResultSearchField;
    const pass = String(formData.get("pass") ?? "all") as ExamResultPassFilter;

    startTransition(() => {
      router.push(
        `/admin/exam-results${buildExamResultListQueryString({ page: 1, search, field, pass }, query)}`,
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
        <select name="field" defaultValue={query.field} style={{ ...inputBox, cursor: "pointer" }}>
          {Object.entries(EXAM_RESULT_SEARCH_FIELD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          name="search"
          defaultValue={query.search}
          placeholder="학생명, 아이디, 과정명, 시험명으로 검색"
          style={{ ...inputBox, width: 300 }}
        />
        <select name="pass" defaultValue={query.pass} style={{ ...inputBox, cursor: "pointer" }}>
          {Object.entries(EXAM_RESULT_PASS_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
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
    </div>
  );
}
