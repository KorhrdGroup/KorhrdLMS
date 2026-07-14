import { listLectures } from "@/features/lectures/repositories/lecture.repository";
import type {
  Lecture,
  LectureCourseOption,
  LectureFilterOptions,
  LectureListItem,
  LectureListQuery,
  LectureOption,
} from "@/features/lectures/types/lecture.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

function toListItem(lecture: Lecture): LectureListItem {
  return {
    id: lecture.id,
    courseId: lecture.courseId,
    courseName: lecture.courseName,
    title: lecture.title,
    description: lecture.description,
    thumbnailFileName: lecture.thumbnailFileName,
    isPublished: lecture.isPublished,
    sessionCount: lecture.sessions.length,
    createdAt: lecture.createdAt,
  };
}

export async function fetchLectureCourseOptions(): Promise<LectureCourseOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, code")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getLectureList(
  query: LectureListQuery,
): Promise<PaginatedResult<LectureListItem>> {
  let items = (await listLectures()).map(toListItem);

  if (query.courseId) {
    items = items.filter((item) => item.courseId === query.courseId);
  }

  if (query.publish === "published") {
    items = items.filter((item) => item.isPublished);
  } else if (query.publish === "unpublished") {
    items = items.filter((item) => !item.isPublished);
  }

  if (query.search) {
    const keyword = query.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.courseName.toLowerCase().includes(keyword),
    );
  }

  items = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const total = items.length;
  const { from, to } = getPaginationRange(query.page, query.pageSize);
  const data = items.slice(from, to + 1);

  return {
    data,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getLectureFilterOptions(): Promise<LectureFilterOptions> {
  const courses = await fetchLectureCourseOptions();
  return { courses };
}

/**
 * 다른 도메인(예: 시험관리)에서 "연결 강의"를 선택할 때 사용하는 경량 목록입니다.
 */
export async function getLectureOptions(): Promise<LectureOption[]> {
  const lectures = await listLectures();

  return lectures.map((lecture) => ({
    id: lecture.id,
    title: lecture.title,
    courseName: lecture.courseName,
    isPublished: lecture.isPublished,
  }));
}
