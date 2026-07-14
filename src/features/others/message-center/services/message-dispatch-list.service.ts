import { MESSAGE_DISPATCH_LIST_SELECT } from "@/features/others/message-center/constants";
import {
  formatRecipientLabel,
  truncateMessageContent,
} from "@/features/others/message-center/lib/message-dispatch.utils";
import {
  getDispatchDateRange,
  getEffectiveDateRange,
} from "@/features/others/message-center/lib/message-dispatch-list-query";
import type {
  MessageDispatchListItem,
  MessageDispatchListQuery,
} from "@/features/others/message-center/types/message-dispatch.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";
import type {
  MessageChannel,
  MessageDispatchType,
  MessageSendStatus,
} from "@/types/database.types";

type MessageDispatchListRow = {
  id: string;
  channel: MessageChannel;
  dispatch_type: MessageDispatchType;
  status: MessageSendStatus;
  recipient_name: string | null;
  recipient_phone: string | null;
  bulk_summary: string | null;
  recipient_count: number;
  title: string | null;
  content: string;
  scheduled_at: string | null;
  sent_at: string | null;
  success_count: number;
  fail_count: number;
  created_at: string;
};

function mapMessageDispatchListItem(row: MessageDispatchListRow): MessageDispatchListItem {
  return {
    id: row.id,
    channel: row.channel,
    dispatchType: row.dispatch_type,
    status: row.status,
    recipientLabel: formatRecipientLabel(
      row.recipient_name,
      row.recipient_phone,
      row.bulk_summary,
      row.recipient_count,
    ),
    contentPreview: truncateMessageContent(row.content),
    scheduledAt: row.scheduled_at,
    sentAt: row.sent_at,
    recipientCount: row.recipient_count,
    successCount: row.success_count,
    failCount: row.fail_count,
    createdAt: row.created_at,
  };
}

export async function getMessageDispatchList(
  query: MessageDispatchListQuery,
): Promise<PaginatedResult<MessageDispatchListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);
  const { startAt, endAt } = getDispatchDateRange(query);

  let builder = supabase
    .from("message_dispatches")
    .select(MESSAGE_DISPATCH_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (query.channel) {
    builder = builder.eq("channel", query.channel);
  }

  if (query.dispatchType) {
    builder = builder.eq("dispatch_type", query.dispatchType);
  }

  if (query.status) {
    builder = builder.eq("status", query.status);
  }

  if (startAt) {
    builder = builder.gte("created_at", startAt);
  }

  if (endAt) {
    builder = builder.lte("created_at", endAt);
  }

  if (query.search) {
    const keyword = `%${query.search}%`;
    builder = builder.or(
      `recipient_name.ilike.${keyword},recipient_phone.ilike.${keyword},bulk_summary.ilike.${keyword},content.ilike.${keyword},title.ilike.${keyword}`,
    );
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as MessageDispatchListRow[];
  const total = count ?? 0;

  return {
    data: rows.map(mapMessageDispatchListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export { getEffectiveDateRange };
