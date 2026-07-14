import { NOTICE_POPUP_DETAIL_SELECT } from "@/features/others/notice-popups/constants";
import type { GetNoticePopupForEditResult } from "@/features/others/notice-popups/types/notice-popup.types";
import { createClient } from "@/lib/supabase/server";

export async function getNoticePopupForEdit(
  popupId: string,
): Promise<GetNoticePopupForEditResult> {
  if (!popupId.trim()) {
    return { success: false, message: "공지팝업을 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notice_popups")
    .select(NOTICE_POPUP_DETAIL_SELECT)
    .eq("id", popupId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "공지팝업을 찾을 수 없습니다." };
  }

  return {
    success: true,
    popup: {
      id: data.id,
      title: data.title,
      content: data.content,
      isActive: data.is_active,
      isNotice: data.is_notice,
      attachmentFileName: data.attachment_file_name ?? "",
      attachmentFileUrl: data.attachment_file_url ?? "",
      displayStartDate: data.display_start_date ?? "",
      displayEndDate: data.display_end_date ?? "",
      sortOrder: data.sort_order,
    },
  };
}
