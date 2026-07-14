import { listNotices } from "@/features/notice-management/repositories/notice.repository";
import type {
  Notice,
  NoticeListItem,
  NoticeListQuery,
} from "@/features/notice-management/types/notice.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";

function toListItem(notice: Notice): NoticeListItem {
  return {
    id: notice.id,
    title: notice.title,
    authorName: notice.authorName,
    isPinned: notice.isPinned,
    isPublished: notice.isPublished,
    viewCount: notice.viewCount,
    createdAt: notice.createdAt,
  };
}

export async function getNoticeList(
  query: NoticeListQuery,
): Promise<PaginatedResult<NoticeListItem>> {
  let items = listNotices().map(toListItem);

  if (query.publish === "published") {
    items = items.filter((item) => item.isPublished);
  } else if (query.publish === "unpublished") {
    items = items.filter((item) => !item.isPublished);
  }

  if (query.pinned === "pinned") {
    items = items.filter((item) => item.isPinned);
  } else if (query.pinned === "unpinned") {
    items = items.filter((item) => !item.isPinned);
  }

  if (query.search) {
    const keyword = query.search.trim().toLowerCase();
    items = items.filter((item) => item.title.toLowerCase().includes(keyword));
  }

  items = [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });

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
