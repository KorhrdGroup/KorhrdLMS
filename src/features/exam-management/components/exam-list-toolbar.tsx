"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import {
  EXAM_KIND_LABELS,
  EXAM_PUBLISH_FILTER_LABELS,
} from "@/features/exam-management/constants";
import { buildExamListQueryString } from "@/features/exam-management/lib/exam-list-query";
import type {
  ExamFilterOptions,
  ExamListQuery,
} from "@/features/exam-management/types/exam.types";

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

type ExamListToolbarProps = {
  query: ExamListQuery;
  filterOptions: ExamFilterOptions;
  onRegisterClick?: () => void;
};

export function ExamListToolbar({ query, filterOptions, onRegisterClick }: ExamListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const courseId = String(formData.get("courseId") ?? "").trim();
    const examKind = String(formData.get("examKind") ?? "") as ExamListQuery["examKind"];
    const publish = String(formData.get("publish") ?? "") as ExamListQuery["publish"];

    startTransition(() => {
      router.push(
        `/admin/exams${buildExamListQueryString({ page: 1, search, courseId, examKind, publish }, query)}`,
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
        <select name="courseId" defaultValue={query.courseId} disabled={isPending} style={{ ...inputBox, cursor: "pointer", maxWidth: 200 }}>
          <option value="">전체 과정</option>
          {filterOptions.courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <select name="examKind" defaultValue={query.examKind} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체 종류</option>
          {Object.entries(EXAM_KIND_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select name="publish" defaultValue={query.publish} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체 상태</option>
          {Object.entries(EXAM_PUBLISH_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input name="search" defaultValue={query.search} placeholder="시험명, 과정명으로 검색" style={{ ...inputBox, width: 240 }} />

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
        + 시험등록
      </button>
    </div>
  );
}
