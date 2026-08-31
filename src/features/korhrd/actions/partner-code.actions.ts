"use server";

import { createClient } from "@/lib/supabase/server";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/** 등록된 파트너스 코드 — 회원가입 폼(member-registration.service)과 같은 목록 */
const VALID_PARTNER_CODES = new Set(["STAR"]);

export type PartnerCodeResult = { success: boolean; message: string };

/**
 * 소셜 가입 환영 팝업에서 파트너스 코드를 등록합니다.
 * 일반 회원가입 폼과 달리 가입 후에 받으므로, 이미 코드가 있는 회원은 덮어쓰지 않습니다.
 */
export async function registerMyPartnerCodeAction(code: string): Promise<PartnerCodeResult> {
  const member = await getMockableStudentMember();
  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, message: "파트너스 코드를 입력해주세요." };
  }
  if (!VALID_PARTNER_CODES.has(normalized)) {
    return { success: false, message: "유효하지 않은 파트너스 코드입니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ partner_code: normalized })
    .eq("id", member.id)
    .is("partner_code", null);
  if (error) {
    return { success: false, message: "등록에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  return { success: true, message: "파트너스 코드가 등록되었습니다." };
}
