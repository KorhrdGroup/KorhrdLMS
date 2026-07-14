"use server";

import {
  deleteNotice,
  getNoticeForEdit,
  updateNotice,
} from "@/features/notice-management/services/notice-edit.service";
import type {
  GetNoticeForEditResult,
  NoticeDeleteResult,
  NoticeEditInput,
  NoticeEditResult,
} from "@/features/notice-management/types/notice.types";

export async function getNoticeForEditAction(
  noticeId: string,
): Promise<GetNoticeForEditResult> {
  return getNoticeForEdit(noticeId);
}

export async function updateNoticeAction(
  noticeId: string,
  input: NoticeEditInput,
): Promise<NoticeEditResult> {
  return updateNotice(noticeId, input);
}

export async function deleteNoticeAction(noticeId: string): Promise<NoticeDeleteResult> {
  return deleteNotice(noticeId);
}
