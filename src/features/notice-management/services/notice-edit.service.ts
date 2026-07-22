import {
  deleteNoticeRecord,
  findNoticeById,
  updateNoticeRecord,
} from "@/features/notice-management/repositories/notice.repository";
import { validateNoticeInput } from "@/features/notice-management/services/notice-registration.service";
import type {
  GetNoticeForEditResult,
  NoticeDeleteResult,
  NoticeEditInput,
  NoticeEditResult,
} from "@/features/notice-management/types/notice.types";

export async function getNoticeForEdit(noticeId: string): Promise<GetNoticeForEditResult> {
  const notice = await findNoticeById(noticeId);

  if (!notice) {
    return { success: false, message: "공지 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    notice: {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      attachment: notice.attachment,
      isPinned: notice.isPinned,
      isPublished: notice.isPublished,
      authorName: notice.authorName,
      viewCount: notice.viewCount,
    },
  };
}

export async function updateNotice(
  noticeId: string,
  input: NoticeEditInput,
): Promise<NoticeEditResult> {
  const existing = await findNoticeById(noticeId);
  if (!existing) {
    return { success: false, message: "공지 정보를 찾을 수 없습니다." };
  }

  const parsed = validateNoticeInput(input);

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  const updated = await updateNoticeRecord(noticeId, {
    title: parsed.title,
    content: parsed.content,
    attachment: parsed.attachment ?? existing.attachment,
    isPinned: parsed.isPinned,
    isPublished: parsed.isPublished,
  });

  if (!updated) {
    return { success: false, message: "공지 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: `"${updated.title}" 공지가 수정되었습니다.` };
}

export async function deleteNotice(noticeId: string): Promise<NoticeDeleteResult> {
  const notice = await findNoticeById(noticeId);

  if (!notice) {
    return { success: false, message: "삭제할 공지를 찾을 수 없습니다." };
  }

  await deleteNoticeRecord(noticeId);

  return { success: true, message: `"${notice.title}" 공지가 삭제되었습니다.` };
}
