import type { AssignmentListQuery } from "@/features/assignment-management/types/assignment.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/list-query";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isPublishFilter(
  value: string | undefined,
): value is AssignmentListQuery["publish"] {
  return value === "published" || value === "unpublished";
}

export function parseAssignmentListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): AssignmentListQuery {
  const page = Math.max(1, Number(first(searchParams.page)) || 1);
  const pageSize = Number(first(searchParams.pageSize)) || DEFAULT_PAGE_SIZE;
  const search = (first(searchParams.search) ?? "").trim();
  const courseId = (first(searchParams.courseId) ?? "").trim();
  const rawPublish = first(searchParams.publish);
  const publish = isPublishFilter(rawPublish) ? rawPublish : "";

  return { page, pageSize, search, courseId, publish };
}

export function buildAssignmentListQueryString(
  params: Partial<AssignmentListQuery>,
  base?: AssignmentListQuery,
): string {
  const merged: AssignmentListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    courseId: params.courseId ?? base?.courseId ?? "",
    publish: params.publish ?? base?.publish ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.courseId) query.set("courseId", merged.courseId);
  if (merged.publish) query.set("publish", merged.publish);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildAssignmentPageHref(page: number, query: AssignmentListQuery) {
  return `/admin/assignments${buildAssignmentListQueryString({ page }, query)}`;
}
