import type { NoticeListQuery } from "@/features/notice-management/types/notice.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/list-query";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isPublishFilter(
  value: string | undefined,
): value is NoticeListQuery["publish"] {
  return value === "published" || value === "unpublished";
}

function isPinnedFilter(value: string | undefined): value is NoticeListQuery["pinned"] {
  return value === "pinned" || value === "unpinned";
}

export function parseNoticeListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): NoticeListQuery {
  const page = Math.max(1, Number(first(searchParams.page)) || 1);
  const pageSize = Number(first(searchParams.pageSize)) || DEFAULT_PAGE_SIZE;
  const search = (first(searchParams.search) ?? "").trim();
  const rawPublish = first(searchParams.publish);
  const publish = isPublishFilter(rawPublish) ? rawPublish : "";
  const rawPinned = first(searchParams.pinned);
  const pinned = isPinnedFilter(rawPinned) ? rawPinned : "";

  return { page, pageSize, search, publish, pinned };
}

export function buildNoticeListQueryString(
  params: Partial<NoticeListQuery>,
  base?: NoticeListQuery,
): string {
  const merged: NoticeListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    publish: params.publish ?? base?.publish ?? "",
    pinned: params.pinned ?? base?.pinned ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.publish) query.set("publish", merged.publish);
  if (merged.pinned) query.set("pinned", merged.pinned);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildNoticePageHref(page: number, query: NoticeListQuery) {
  return `/admin/notices${buildNoticeListQueryString({ page }, query)}`;
}
