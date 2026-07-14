import type {
  MessageChannel,
  MessageDispatchType,
  MessageSendStatus,
} from "@/types/database.types";

export const MESSAGE_CHANNEL_LABELS: Record<MessageChannel, string> = {
  sms: "SMS",
  lms: "LMS",
  kakao_alimtalk: "카카오 알림톡",
  kakao_friendtalk: "친구톡",
  email: "이메일",
};

export const MESSAGE_CHANNEL_FILTER_OPTIONS = [
  "sms",
  "lms",
  "kakao_alimtalk",
  "email",
] as const satisfies readonly MessageChannel[];

export const MESSAGE_CHANNEL_FORM_OPTIONS = [
  "sms",
  "lms",
  "kakao_alimtalk",
  "kakao_friendtalk",
  "email",
] as const satisfies readonly MessageChannel[];

export const MESSAGE_DISPATCH_TYPE_LABELS: Record<MessageDispatchType, string> = {
  single: "단건발송",
  bulk: "대량발송",
  scheduled: "발송예약",
};

export const MESSAGE_DISPATCH_TYPE_FILTER_OPTIONS = [
  "single",
  "bulk",
  "scheduled",
] as const satisfies readonly MessageDispatchType[];

export const MESSAGE_SEND_STATUS_LABELS: Record<MessageSendStatus, string> = {
  draft: "준비",
  scheduled: "예약",
  pending: "대기",
  sent: "발송완료",
  failed: "실패",
  canceled: "취소",
};

export const MESSAGE_SEND_STATUS_FILTER_OPTIONS = [
  "draft",
  "scheduled",
  "pending",
  "sent",
  "failed",
  "canceled",
] as const satisfies readonly MessageSendStatus[];

export const MESSAGE_QUICK_PERIOD_OPTIONS = [
  { value: "1w", label: "1주일" },
  { value: "1m", label: "1개월" },
  { value: "2m", label: "2개월" },
  { value: "3m", label: "3개월" },
] as const;

export const MESSAGE_DISPATCH_LIST_SELECT = `
  id,
  channel,
  dispatch_type,
  status,
  recipient_name,
  recipient_phone,
  bulk_summary,
  recipient_count,
  title,
  content,
  scheduled_at,
  sent_at,
  success_count,
  fail_count,
  sender_name,
  memo,
  created_at
` as const;

export const MESSAGE_DISPATCH_DETAIL_SELECT = `
  id,
  channel,
  dispatch_type,
  status,
  recipient_name,
  recipient_phone,
  bulk_summary,
  recipient_count,
  title,
  content,
  scheduled_at,
  sent_at,
  success_count,
  fail_count,
  sender_name,
  memo,
  created_at,
  updated_at
` as const;
