import type {
  MessageBulkPrepareInput,
  MessageMutationResult,
  MessageSingleSendInput,
} from "@/features/others/message-center/types/message-form.types";
import { createClient } from "@/lib/supabase/server";
import type { Database, MessageSendStatus } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toScheduledAt(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.includes("+") || value.endsWith("Z")) {
    return value;
  }

  return `${value.length === 16 ? `${value}:00` : value}+09:00`;
}

function resolveSingleSendStatus(scheduledAt: string | null): MessageSendStatus {
  if (scheduledAt) {
    return "scheduled";
  }

  return "sent";
}

function resolveBulkPrepareStatus(scheduledAt: string | null): MessageSendStatus {
  if (scheduledAt) {
    return "scheduled";
  }

  return "draft";
}

export function validateMessageSingleSendInput(
  input: MessageSingleSendInput,
): MessageMutationResult {
  if (!normalize(input.recipientName)) {
    return { success: false, message: "수신자명을 입력해주세요.", field: "recipientName" };
  }

  if (!normalize(input.recipientPhone)) {
    return {
      success: false,
      message: "수신번호를 입력해주세요.",
      field: "recipientPhone",
    };
  }

  if (!normalize(input.content)) {
    return { success: false, message: "메시지 내용을 입력해주세요.", field: "content" };
  }

  if (!normalize(input.senderName)) {
    return { success: false, message: "발송자를 입력해주세요.", field: "senderName" };
  }

  return { success: true, message: "" };
}

export function validateMessageBulkPrepareInput(
  input: MessageBulkPrepareInput,
): MessageMutationResult {
  if (!normalize(input.bulkSummary)) {
    return { success: false, message: "발송 대상을 입력해주세요.", field: "bulkSummary" };
  }

  if (!Number.isFinite(input.recipientCount) || input.recipientCount < 1) {
    return {
      success: false,
      message: "수신자 수는 1명 이상이어야 합니다.",
      field: "recipientCount",
    };
  }

  if (!normalize(input.content)) {
    return { success: false, message: "메시지 내용을 입력해주세요.", field: "content" };
  }

  if (!normalize(input.senderName)) {
    return { success: false, message: "발송자를 입력해주세요.", field: "senderName" };
  }

  return { success: true, message: "" };
}

export async function createMessageSingleSend(
  input: MessageSingleSendInput,
): Promise<MessageMutationResult> {
  const validation = validateMessageSingleSendInput(input);
  if (!validation.success) {
    return validation;
  }

  const scheduledAt = toScheduledAt(emptyToNull(input.scheduledAt));
  const status = resolveSingleSendStatus(scheduledAt);
  const now = new Date().toISOString();

  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["message_dispatches"]["Insert"] = {
    channel: input.channel,
    dispatch_type: scheduledAt ? "scheduled" : "single",
    status,
    recipient_name: normalize(input.recipientName),
    recipient_phone: normalize(input.recipientPhone),
    recipient_count: 1,
    title: emptyToNull(input.title),
    content: normalize(input.content),
    scheduled_at: scheduledAt,
    sent_at: status === "sent" ? now : null,
    success_count: status === "sent" ? 1 : 0,
    fail_count: 0,
    sender_name: normalize(input.senderName),
    memo: emptyToNull(input.memo),
  };

  const { data, error } = await supabase
    .from("message_dispatches")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: scheduledAt ? "발송이 예약되었습니다." : "단건발송 내역이 등록되었습니다.",
    dispatchId: data.id,
  };
}

export async function createMessageBulkPrepare(
  input: MessageBulkPrepareInput,
): Promise<MessageMutationResult> {
  const validation = validateMessageBulkPrepareInput(input);
  if (!validation.success) {
    return validation;
  }

  const scheduledAt = toScheduledAt(emptyToNull(input.scheduledAt));
  const status = resolveBulkPrepareStatus(scheduledAt);

  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["message_dispatches"]["Insert"] = {
    channel: input.channel,
    dispatch_type: scheduledAt ? "scheduled" : "bulk",
    status,
    bulk_summary: normalize(input.bulkSummary),
    recipient_count: input.recipientCount,
    title: emptyToNull(input.title),
    content: normalize(input.content),
    scheduled_at: scheduledAt,
    success_count: 0,
    fail_count: 0,
    sender_name: normalize(input.senderName),
    memo: emptyToNull(input.memo),
  };

  const { data, error } = await supabase
    .from("message_dispatches")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: scheduledAt
      ? "대량발송 예약이 등록되었습니다."
      : "대량발송 준비 내역이 등록되었습니다.",
    dispatchId: data.id,
  };
}
