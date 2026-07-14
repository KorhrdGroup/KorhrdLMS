import type {
  MessageChannel,
  MessageDispatchType,
  MessageSendStatus,
} from "@/types/database.types";

export type MessageQuickPeriod = "" | "1w" | "1m" | "2m" | "3m";

export type MessageDispatchListQuery = {
  page: number;
  pageSize: number;
  channel: MessageChannel | "";
  dispatchType: MessageDispatchType | "";
  status: MessageSendStatus | "";
  quickPeriod: MessageQuickPeriod;
  startDate: string;
  endDate: string;
  search: string;
};

export type MessageDispatchListItem = {
  id: string;
  channel: MessageChannel;
  dispatchType: MessageDispatchType;
  status: MessageSendStatus;
  recipientLabel: string;
  contentPreview: string;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  successCount: number;
  failCount: number;
  createdAt: string;
};

export type MessageDispatchDetail = {
  id: string;
  channel: MessageChannel;
  dispatchType: MessageDispatchType;
  status: MessageSendStatus;
  recipientName: string | null;
  recipientPhone: string | null;
  bulkSummary: string | null;
  recipientCount: number;
  title: string | null;
  content: string;
  scheduledAt: string | null;
  sentAt: string | null;
  successCount: number;
  failCount: number;
  senderName: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetMessageDispatchDetailResult =
  | { success: true; dispatch: MessageDispatchDetail }
  | { success: false; message: string };
