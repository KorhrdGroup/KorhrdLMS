import { NOTICE_POPUP_LIST_SELECT } from "@/features/others/notice-popups/constants";
import type {
  NoticePopupListItem,
  NoticePopupListQuery,
} from "@/features/others/notice-popups/types/notice-popup.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

type NoticePopupListRow = {
  id: string;
  title: string;
  is_active: boolean;
  is_notice: boolean;
  attachment_file_name: string | null;
  display_start_date: string | null;
  display_end_date: string | null;
  sort_order: number;
  created_at: string;
};

function mapNoticePopupListItem(row: NoticePopupListRow): NoticePopupListItem {
  return {
    id: row.id,
    title: row.title,
    isActive: row.is_active,
    isNotice: row.is_notice,
    attachmentFileName: row.attachment_file_name,
    displayStartDate: row.display_start_date,
    displayEndDate: row.display_end_date,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function getNoticePopupList(
  query: NoticePopupListQuery,
): Promise<PaginatedResult<NoticePopupListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("notice_popups")
    .select(NOTICE_POPUP_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (query.isActive === "true") {
    builder = builder.eq("is_active", true);
  }

  if (query.isActive === "false") {
    builder = builder.eq("is_active", false);
  }

  if (query.isNotice === "true") {
    builder = builder.eq("is_notice", true);
  }

  if (query.isNotice === "false") {
    builder = builder.eq("is_notice", false);
  }

  if (query.search) {
    const keyword = `%${query.search}%`;
    builder = builder.or(`title.ilike.${keyword},content.ilike.${keyword}`);
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as NoticePopupListRow[];
  const total = count ?? 0;

  return {
    data: rows.map(mapNoticePopupListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}
