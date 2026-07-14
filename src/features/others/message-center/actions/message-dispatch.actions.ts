"use server";

import { getMessageDispatchDetail } from "@/features/others/message-center/services/message-dispatch-detail.service";
import {
  createMessageBulkPrepare,
  createMessageSingleSend,
} from "@/features/others/message-center/services/message-dispatch-mutation.service";
import type {
  GetMessageDispatchDetailResult,
} from "@/features/others/message-center/types/message-dispatch.types";
import type {
  MessageBulkPrepareInput,
  MessageMutationResult,
  MessageSingleSendInput,
} from "@/features/others/message-center/types/message-form.types";

export async function getMessageDispatchDetailAction(
  dispatchId: string,
): Promise<GetMessageDispatchDetailResult> {
  return getMessageDispatchDetail(dispatchId);
}

export async function createMessageSingleSendAction(
  input: MessageSingleSendInput,
): Promise<MessageMutationResult> {
  return createMessageSingleSend(input);
}

export async function createMessageBulkPrepareAction(
  input: MessageBulkPrepareInput,
): Promise<MessageMutationResult> {
  return createMessageBulkPrepare(input);
}
