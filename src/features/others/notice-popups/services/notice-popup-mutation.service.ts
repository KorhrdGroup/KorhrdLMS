import type {
  NoticePopupDeleteResult,
  NoticePopupInput,
  NoticePopupMutationResult,
} from "@/features/others/notice-popups/types/notice-popup-form.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateNoticePopupInput(input: NoticePopupInput): NoticePopupMutationResult {
  if (!normalize(input.title)) {
    return { success: false, message: "제목을 입력해주세요.", field: "title" };
  }

  if (!normalize(input.content)) {
    return { success: false, message: "내용을 입력해주세요.", field: "content" };
  }

  if (!Number.isFinite(input.sortOrder)) {
    return { success: false, message: "정렬순서를 입력해주세요.", field: "sortOrder" };
  }

  return { success: true, message: "" };
}

function mapNoticePopupPayload(input: NoticePopupInput) {
  return {
    title: normalize(input.title),
    content: normalize(input.content),
    is_active: input.isActive,
    is_notice: input.isNotice,
    attachment_file_name: emptyToNull(input.attachmentFileName),
    attachment_file_url: emptyToNull(input.attachmentFileUrl),
    display_start_date: emptyToNull(input.displayStartDate),
    display_end_date: emptyToNull(input.displayEndDate),
    sort_order: input.sortOrder,
  };
}

export async function createNoticePopup(
  input: NoticePopupInput,
): Promise<NoticePopupMutationResult> {
  const validation = validateNoticePopupInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["notice_popups"]["Insert"] =
    mapNoticePopupPayload(input);

  const { data, error } = await supabase
    .from("notice_popups")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "공지팝업이 등록되었습니다.", popupId: data.id };
}

export async function updateNoticePopup(
  popupId: string,
  input: NoticePopupInput,
): Promise<NoticePopupMutationResult> {
  const validation = validateNoticePopupInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notice_popups")
    .update(mapNoticePopupPayload(input))
    .eq("id", popupId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "공지팝업을 찾을 수 없습니다." };
  }

  return { success: true, message: "공지팝업이 수정되었습니다.", popupId: data.id };
}

export async function deleteNoticePopup(popupId: string): Promise<NoticePopupDeleteResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notice_popups")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", popupId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "공지팝업을 찾을 수 없습니다." };
  }

  return { success: true, message: "공지팝업이 삭제되었습니다." };
}
