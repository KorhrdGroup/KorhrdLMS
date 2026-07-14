import type { NoticePopupListQuery } from "@/features/others/notice-popups/types/notice-popup.types";
import { DEFAULT_PAGE_SIZE, parseListQuery } from "@/lib/shared/list-query";

export function createDefaultNoticePopupListQuery(): NoticePopupListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    search: "",
    isActive: "",
    isNotice: "",
  };
}

export function parseNoticePopupListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): NoticePopupListQuery {
  const base = parseListQuery(searchParams);

  return {
    page: base.page,
    pageSize: base.pageSize,
    search: base.search,
    isActive: parseBooleanFilter(searchParams.isActive),
    isNotice: parseBooleanFilter(searchParams.isNotice),
  };
}

export function buildNoticePopupListQueryString(
  params: Partial<NoticePopupListQuery>,
  base?: NoticePopupListQuery,
): string {
  const merged: NoticePopupListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    isActive: params.isActive ?? base?.isActive ?? "",
    isNotice: params.isNotice ?? base?.isNotice ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.isActive) query.set("isActive", merged.isActive);
  if (merged.isNotice) query.set("isNotice", merged.isNotice);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildNoticePopupPageHref(page: number, query: NoticePopupListQuery) {
  return `/admin/others/notice-popups${buildNoticePopupListQueryString({ page }, query)}`;
}

function parseBooleanFilter(
  value: string | string[] | undefined,
): "" | "true" | "false" {
  const raw = Array.isArray(value) ? value[0]?.trim() : value?.trim();

  if (raw === "true" || raw === "false") {
    return raw;
  }

  return "";
}
