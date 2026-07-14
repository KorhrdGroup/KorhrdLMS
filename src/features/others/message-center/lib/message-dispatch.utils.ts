import {
  MESSAGE_CHANNEL_LABELS,
  MESSAGE_DISPATCH_TYPE_LABELS,
  MESSAGE_SEND_STATUS_LABELS,
} from "@/features/others/message-center/constants";
import type {
  MessageChannel,
  MessageDispatchType,
  MessageSendStatus,
} from "@/types/database.types";

export function getMessageChannelLabel(channel: MessageChannel) {
  return MESSAGE_CHANNEL_LABELS[channel];
}

export function getMessageDispatchTypeLabel(dispatchType: MessageDispatchType) {
  return MESSAGE_DISPATCH_TYPE_LABELS[dispatchType];
}

export function getMessageSendStatusLabel(status: MessageSendStatus) {
  return MESSAGE_SEND_STATUS_LABELS[status];
}

export function truncateMessageContent(value: string, maxLength = 40) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}

export function formatRecipientLabel(
  recipientName: string | null | undefined,
  recipientPhone: string | null | undefined,
  bulkSummary: string | null | undefined,
  recipientCount: number,
) {
  if (bulkSummary?.trim()) {
    return `${bulkSummary.trim()} (${recipientCount}명)`;
  }

  const name = recipientName?.trim();
  const phone = recipientPhone?.trim();

  if (name && phone) {
    return `${name} (${phone})`;
  }

  if (name) {
    return name;
  }

  if (phone) {
    return phone;
  }

  return "—";
}

export function formatOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}
