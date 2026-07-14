import type {
  MessageChannel,
  MessageDispatchType,
} from "@/types/database.types";

export type MessageSingleSendInput = {
  channel: MessageChannel;
  recipientName: string;
  recipientPhone: string;
  title: string;
  content: string;
  scheduledAt: string;
  senderName: string;
  memo: string;
};

export type MessageBulkPrepareInput = {
  channel: MessageChannel;
  bulkSummary: string;
  recipientCount: number;
  title: string;
  content: string;
  scheduledAt: string;
  senderName: string;
  memo: string;
};

export type MessageMutationResult =
  | { success: true; message: string; dispatchId?: string }
  | {
      success: false;
      message: string;
      field?: keyof MessageSingleSendInput | keyof MessageBulkPrepareInput;
    };

export type MessageDispatchTypeHint = MessageDispatchType;
