import { MESSAGE_DISPATCH_DETAIL_SELECT } from "@/features/others/message-center/constants";
import type {
  GetMessageDispatchDetailResult,
  MessageDispatchDetail,
} from "@/features/others/message-center/types/message-dispatch.types";
import { createClient } from "@/lib/supabase/server";
import type {
  MessageChannel,
  MessageDispatchType,
  MessageSendStatus,
} from "@/types/database.types";

type MessageDispatchDetailRow = {
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
  sender_name: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

function mapMessageDispatchDetail(row: MessageDispatchDetailRow): MessageDispatchDetail {
  return {
    id: row.id,
    channel: row.channel,
    dispatchType: row.dispatch_type,
    status: row.status,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    bulkSummary: row.bulk_summary,
    recipientCount: row.recipient_count,
    title: row.title,
    content: row.content,
    scheduledAt: row.scheduled_at,
    sentAt: row.sent_at,
    successCount: row.success_count,
    failCount: row.fail_count,
    senderName: row.sender_name,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getMessageDispatchDetail(
  dispatchId: string,
): Promise<GetMessageDispatchDetailResult> {
  if (!dispatchId.trim()) {
    return { success: false, message: "발송 내역을 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("message_dispatches")
    .select(MESSAGE_DISPATCH_DETAIL_SELECT)
    .eq("id", dispatchId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "발송 내역을 찾을 수 없습니다." };
  }

  return {
    success: true,
    dispatch: mapMessageDispatchDetail(data as MessageDispatchDetailRow),
  };
}
