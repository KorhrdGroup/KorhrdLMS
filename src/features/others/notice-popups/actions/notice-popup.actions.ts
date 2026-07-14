"use server";

import { getNoticePopupForEdit } from "@/features/others/notice-popups/services/notice-popup-detail.service";
import {
  createNoticePopup,
  deleteNoticePopup,
  updateNoticePopup,
} from "@/features/others/notice-popups/services/notice-popup-mutation.service";
import type { GetNoticePopupForEditResult } from "@/features/others/notice-popups/types/notice-popup.types";
import type {
  NoticePopupDeleteResult,
  NoticePopupInput,
  NoticePopupMutationResult,
} from "@/features/others/notice-popups/types/notice-popup-form.types";

export async function getNoticePopupForEditAction(
  popupId: string,
): Promise<GetNoticePopupForEditResult> {
  return getNoticePopupForEdit(popupId);
}

export async function createNoticePopupAction(
  input: NoticePopupInput,
): Promise<NoticePopupMutationResult> {
  return createNoticePopup(input);
}

export async function updateNoticePopupAction(
  popupId: string,
  input: NoticePopupInput,
): Promise<NoticePopupMutationResult> {
  return updateNoticePopup(popupId, input);
}

export async function deleteNoticePopupAction(
  popupId: string,
): Promise<NoticePopupDeleteResult> {
  return deleteNoticePopup(popupId);
}
