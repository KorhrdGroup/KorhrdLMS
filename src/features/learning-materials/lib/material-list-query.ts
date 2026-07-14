import { MATERIAL_FILE_TYPES } from "@/features/learning-materials/constants";
import type { MaterialListQuery } from "@/features/learning-materials/types/material.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/list-query";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isPublishFilter(
  value: string | undefined,
): value is MaterialListQuery["publish"] {
  return value === "published" || value === "unpublished";
}

function isFileTypeFilter(
  value: string | undefined,
): value is MaterialListQuery["fileType"] {
  return !!value && (MATERIAL_FILE_TYPES as string[]).includes(value);
}

export function parseMaterialListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): MaterialListQuery {
  const page = Math.max(1, Number(first(searchParams.page)) || 1);
  const pageSize = Number(first(searchParams.pageSize)) || DEFAULT_PAGE_SIZE;
  const search = (first(searchParams.search) ?? "").trim();
  const courseId = (first(searchParams.courseId) ?? "").trim();
  const rawFileType = first(searchParams.fileType);
  const fileType = isFileTypeFilter(rawFileType) ? rawFileType : "";
  const rawPublish = first(searchParams.publish);
  const publish = isPublishFilter(rawPublish) ? rawPublish : "";

  return { page, pageSize, search, courseId, fileType, publish };
}

export function buildMaterialListQueryString(
  params: Partial<MaterialListQuery>,
  base?: MaterialListQuery,
): string {
  const merged: MaterialListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    courseId: params.courseId ?? base?.courseId ?? "",
    fileType: params.fileType ?? base?.fileType ?? "",
    publish: params.publish ?? base?.publish ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.courseId) query.set("courseId", merged.courseId);
  if (merged.fileType) query.set("fileType", merged.fileType);
  if (merged.publish) query.set("publish", merged.publish);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildMaterialPageHref(page: number, query: MaterialListQuery) {
  return `/admin/learning-materials${buildMaterialListQueryString({ page }, query)}`;
}
