"use server";

import { createNotice } from "@/features/notice-management/services/notice-registration.service";
import type {
  NoticeRegistrationInput,
  NoticeRegistrationResult,
} from "@/features/notice-management/types/notice.types";

export async function createNoticeAction(
  input: NoticeRegistrationInput,
): Promise<NoticeRegistrationResult> {
  return createNotice(input);
}
