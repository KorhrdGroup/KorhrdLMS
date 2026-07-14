import { COURSE_FILTER_SELECT } from "@/features/enrollments/constants";
import { EXAM_LIST_SELECT } from "@/features/exams/constants";
import type {
  ExamQuestionFilterOptions,
  ExamQuestionListItem,
  ExamQuestionListQuery,
} from "@/features/exams/types/exam-question.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";
import type { ExamKind, ExamType } from "@/types/database.types";

type ExamListRow = {
  id: string;
  year: number;
  name: string;
  exam_kind: ExamKind;
  exam_type: ExamType;
  print_enabled: boolean;
  created_at: string;
  course: {
    id: string;
    name: string;
    code: string;
    deleted_at: string | null;
  };
};

function mapExamListItem(row: ExamListRow): ExamQuestionListItem {
  return {
    id: row.id,
    year: row.year,
    courseName: row.course.name,
    name: row.name,
    examKind: row.exam_kind,
    examType: row.exam_type,
    createdAt: row.created_at,
    printEnabled: row.print_enabled,
  };
}

function isExamKind(value: string): value is ExamKind {
  return (
    value === "midterm" ||
    value === "final" ||
    value === "mock" ||
    value === "certificate" ||
    value === "quiz"
  );
}

function isExamType(value: string): value is ExamType {
  return (
    value === "regular" ||
    value === "makeup" ||
    value === "retake" ||
    value === "practice"
  );
}

export async function getExamQuestionList(
  query: ExamQuestionListQuery,
): Promise<PaginatedResult<ExamQuestionListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("exams")
    .select(EXAM_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .is("course.deleted_at", null)
    .order("created_at", { ascending: false });

  if (query.courseId) {
    builder = builder.eq("course_id", query.courseId);
  }

  if (query.examKind && isExamKind(query.examKind)) {
    builder = builder.eq("exam_kind", query.examKind);
  }

  if (query.examType && isExamType(query.examType)) {
    builder = builder.eq("exam_type", query.examType);
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    data: ((data ?? []) as ExamListRow[]).map(mapExamListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getExamQuestionFilterOptions(): Promise<ExamQuestionFilterOptions> {
  const supabase = await createClient();

  const coursesResult = await supabase
    .from("courses")
    .select(COURSE_FILTER_SELECT)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  return {
    courses: (coursesResult.data ?? []).map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
    })),
    examKinds: ["midterm", "final", "mock", "certificate", "quiz"],
    examTypes: ["regular", "makeup", "retake", "practice"],
  };
}
