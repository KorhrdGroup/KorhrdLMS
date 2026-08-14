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
  /** 빈 문자열(분류 없음)은 null 로 저장합니다. */
  category: string | null;
  attachment: NoticeRegistrationInput["attachment"];
  image: NoticeRegistrationInput["image"];
  imageLinkUrl: string | null;
  isPinned: boolean;
  isPublished: boolean;
};

export function validateNoticeInput(
  input: NoticeRegistrationInput,
): { field: keyof NoticeRegistrationInput; message: string } | ParsedNoticeInput {
  if (!normalize(input.title)) {
    return { field: "title", message: "제목을 입력해주세요." };
  }

  // 내용은 선택 입력입니다. 이미지·첨부만으로 공지하는 경우가 있어 비워둘 수 있습니다.
  return {
    title: normalize(input.title),
    content: normalize(input.content),
    category: normalize(input.category) || null,
    attachment: input.attachment,
    image: input.image,
    imageLinkUrl: normalize(input.imageLinkUrl) || null,
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
    category: parsed.category,
    attachment: parsed.attachment,
    image: parsed.image,
    imageLinkUrl: parsed.imageLinkUrl,
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
