"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import { LECTURE_PUBLISH_FILTER_LABELS } from "@/features/lectures/constants";
import { buildLectureListQueryString } from "@/features/lectures/lib/lecture-list-query";
import type {
  LectureFilterOptions,
  LectureListQuery,
} from "@/features/lectures/types/lecture.types";

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

type LectureListToolbarProps = {
  query: LectureListQuery;
  filterOptions: LectureFilterOptions;
  onRegisterClick?: () => void;
};

export function LectureListToolbar({
  query,
  filterOptions,
  onRegisterClick,
}: LectureListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const courseId = String(formData.get("courseId") ?? "").trim();
    const publish = String(formData.get("publish") ?? "") as LectureListQuery["publish"];

    startTransition(() => {
      router.push(
        `/admin/lectures${buildLectureListQueryString({ page: 1, search, courseId, publish }, query)}`,
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

        <select name="publish" defaultValue={query.publish} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체 상태</option>
          {Object.entries(LECTURE_PUBLISH_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input name="search" defaultValue={query.search} placeholder="강의명, 설명으로 검색" style={{ ...inputBox, width: 260 }} />

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
        + 강의등록
      </button>
    </div>
  );
}
