import { listExams } from "@/features/exam-management/repositories/exam.repository";
import type {
  Exam,
  ExamCourseOption,
  ExamFilterOptions,
  ExamListItem,
  ExamListQuery,
} from "@/features/exam-management/types/exam.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

function toListItem(exam: Exam): ExamListItem {
  return {
    id: exam.id,
    courseId: exam.courseId,
    courseName: exam.courseName,
    title: exam.title,
    examKind: exam.examKind,
    durationMinutes: exam.durationMinutes,
    passScore: exam.passScore,
    isPublished: exam.isPublished,
    questionCount: exam.questions.length,
    createdAt: exam.createdAt,
  };
}

export async function fetchExamCourseOptions(): Promise<ExamCourseOption[]> {
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

export async function getExamList(
  query: ExamListQuery,
): Promise<PaginatedResult<ExamListItem>> {
  let items = (await listExams()).map(toListItem);

  if (query.courseId) {
    items = items.filter((item) => item.courseId === query.courseId);
  }

  if (query.examKind) {
    items = items.filter((item) => item.examKind === query.examKind);
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

export async function getExamFilterOptions(): Promise<ExamFilterOptions> {
  const courses = await fetchExamCourseOptions();
  return { courses };
}
