import { createNoticeRecord } from "@/features/notice-management/repositories/notice.repository";
import type {
  Notice,
  NoticeRegistrationInput,
  NoticeRegistrationResult,
} from "@/features/notice-management/types/notice.types";

function normalize(value: string) {
  return value.trim();
}

export type ParsedNoticeInput = {
  title: string;
  content: string;
  attachment: NoticeRegistrationInput["attachment"];
  isPinned: boolean;
  isPublished: boolean;
};

export function validateNoticeInput(
  input: NoticeRegistrationInput,
): { field: keyof NoticeRegistrationInput; message: string } | ParsedNoticeInput {
  if (!normalize(input.title)) {
    return { field: "title", message: "제목을 입력해주세요." };
  }

  if (!normalize(input.content)) {
    return { field: "content", message: "내용을 입력해주세요." };
  }

  return {
    title: normalize(input.title),
    content: normalize(input.content),
    attachment: input.attachment,
    isPinned: input.isPinned,
    isPublished: input.isPublished,
  };
}

const DEFAULT_AUTHOR_NAME = "관리자";

export async function createNotice(
  input: NoticeRegistrationInput,
): Promise<NoticeRegistrationResult> {
  const parsed = validateNoticeInput(input);

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  const notice: Notice = await createNoticeRecord({
    title: parsed.title,
    content: parsed.content,
    attachment: parsed.attachment,
    isPinned: parsed.isPinned,
    isPublished: parsed.isPublished,
    authorName: DEFAULT_AUTHOR_NAME,
  });

  return {
    success: true,
    noticeId: notice.id,
    message: `"${notice.title}" 공지가 등록되었습니다.`,
  };
}
