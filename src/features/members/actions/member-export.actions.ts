"use server";

import { buildMemberExportXlsx } from "@/features/members/services/member-export.service";
import type { MemberListQuery } from "@/features/members/services/member-list.service";
import { todayInKst } from "@/lib/shared/kst-date";

export async function exportMembersAction(
  query: MemberListQuery,
): Promise<
  { success: true; xlsxBase64: string; filename: string } | { success: false; message: string }
> {
  try {
    const xlsxBase64 = await buildMemberExportXlsx(query);
    return {
      success: true,
      xlsxBase64,
      filename: `회원목록_${todayInKst().replaceAll("-", "")}.xlsx`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Excel 다운로드에 실패했습니다.",
    };
  }
}
