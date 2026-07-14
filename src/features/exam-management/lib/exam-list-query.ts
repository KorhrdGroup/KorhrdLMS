import type { ExamKind, ExamListQuery } from "@/features/exam-management/types/exam.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/list-query";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isPublishFilter(value: string | undefined): value is ExamListQuery["publish"] {
  return value === "published" || value === "unpublished";
}

function isExamKind(value: string | undefined): value is ExamKind {
  return (
    value === "final_exam" ||
    value === "midterm" ||
    value === "final" ||
    value === "mock" ||
    value === "certificate" ||
    value === "quiz"
  );
}

export function parseExamListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ExamListQuery {
  const page = Math.max(1, Number(first(searchParams.page)) || 1);
  const pageSize = Number(first(searchParams.pageSize)) || DEFAULT_PAGE_SIZE;
  const search = (first(searchParams.search) ?? "").trim();
  const courseId = (first(searchParams.courseId) ?? "").trim();
  const rawKind = first(searchParams.examKind);
  const examKind = isExamKind(rawKind) ? rawKind : "";
  const rawPublish = first(searchParams.publish);
  const publish = isPublishFilter(rawPublish) ? rawPublish : "";

  return { page, pageSize, search, courseId, examKind, publish };
}

export function buildExamListQueryString(
  params: Partial<ExamListQuery>,
  base?: ExamListQuery,
): string {
  const merged: ExamListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    courseId: params.courseId ?? base?.courseId ?? "",
    examKind: params.examKind ?? base?.examKind ?? "",
    publish: params.publish ?? base?.publish ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.courseId) query.set("courseId", merged.courseId);
  if (merged.examKind) query.set("examKind", merged.examKind);
  if (merged.publish) query.set("publish", merged.publish);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildExamPageHref(page: number, query: ExamListQuery) {
  return `/admin/exams${buildExamListQueryString({ page }, query)}`;
}
