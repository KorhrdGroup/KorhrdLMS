import type { ExamQuestionListQuery } from "@/features/exams/types/exam-question.types";
import {
  DEFAULT_PAGE_SIZE,
  parseListQuery,
} from "@/lib/shared/list-query";

export function createDefaultExamQuestionListQuery(): ExamQuestionListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    courseId: "",
    examKind: "",
    examType: "",
  };
}

export function parseExamQuestionListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ExamQuestionListQuery {
  const base = parseListQuery(searchParams);

  return {
    page: base.page,
    pageSize: base.pageSize,
    courseId: parseStringParam(searchParams.courseId),
    examKind: parseStringParam(searchParams.examKind),
    examType: parseStringParam(searchParams.examType),
  };
}

export function buildExamQuestionListQueryString(
  params: Partial<ExamQuestionListQuery>,
  base?: ExamQuestionListQuery,
): string {
  const merged: ExamQuestionListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    courseId: params.courseId ?? base?.courseId ?? "",
    examKind: params.examKind ?? base?.examKind ?? "",
    examType: params.examType ?? base?.examType ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.courseId) query.set("courseId", merged.courseId);
  if (merged.examKind) query.set("examKind", merged.examKind);
  if (merged.examType) query.set("examType", merged.examType);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildExamQuestionPageHref(
  page: number,
  query: ExamQuestionListQuery,
) {
  return `/admin/exams/questions${buildExamQuestionListQueryString({ page }, query)}`;
}

function parseStringParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}
