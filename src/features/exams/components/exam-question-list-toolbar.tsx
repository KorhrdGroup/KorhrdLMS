"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import {
  EXAM_KIND_LABELS,
  EXAM_TYPE_LABELS,
} from "@/features/exams/constants";
import { buildExamQuestionListQueryString } from "@/features/exams/lib/exam-question-list-query";
import type {
  ExamQuestionFilterOptions,
  ExamQuestionListQuery,
} from "@/features/exams/types/exam-question.types";

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

type ExamQuestionListToolbarProps = {
  query: ExamQuestionListQuery;
  filterOptions: ExamQuestionFilterOptions;
};

export function ExamQuestionListToolbar({
  query,
  filterOptions,
}: ExamQuestionListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const courseId = String(formData.get("courseId") ?? "").trim();
    const examKind = String(formData.get("examKind") ?? "").trim();
    const examType = String(formData.get("examType") ?? "").trim();

    startTransition(() => {
      router.push(
        `/admin/exams/questions${buildExamQuestionListQueryString(
          { page: 1, courseId, examKind, examType },
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
        <select name="courseId" defaultValue={query.courseId} disabled={isPending} style={{ ...inputBox, cursor: "pointer", maxWidth: 220 }}>
          <option value="">전체 과정</option>
          {filterOptions.courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <select name="examKind" defaultValue={query.examKind} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체 시험종류</option>
          {filterOptions.examKinds.map((kind) => (
            <option key={kind} value={kind}>
              {EXAM_KIND_LABELS[kind]}
            </option>
          ))}
        </select>

        <select name="examType" defaultValue={query.examType} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체 시험유형</option>
          {filterOptions.examTypes.map((type) => (
            <option key={type} value={type}>
              {EXAM_TYPE_LABELS[type]}
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
