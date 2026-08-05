"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 아이디 찾기 / 비밀번호 재설정 요청.
 *
 * 계정 존재 여부를 그대로 알려주면 회원 정보를 추측당할 수 있어,
 * 실패 메시지는 항상 같은 문구로 돌려줍니다(아이디 찾기는 마스킹해 노출).
 */
const digits = (value: string) => value.replace(/\D/g, "");

/** "hanpyeong01" → "hanp*****1" */
function maskLoginId(loginId: string): string {
  if (loginId.length <= 2) return loginId;
  const head = loginId.slice(0, Math.min(4, loginId.length - 1));
  const tail = loginId.slice(-1);
  return `${head}${"*".repeat(Math.max(1, loginId.length - head.length - 1))}${tail}`;
}

export type FindIdResult =
  | { success: true; loginId: string; joinedAt: string }
  | { success: false; message: string };

export async function findLoginIdAction(input: {
  name: string;
  phone: string;
}): Promise<FindIdResult> {
  const name = input.name.trim();
  const phone = digits(input.phone);
  if (!name || !phone) {
    return { success: false, message: "이름과 휴대폰 번호를 모두 입력해주세요." };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("login_id, phone, created_at")
    .eq("name", name)
    .is("deleted_at", null);

  // 저장된 형식(하이픈 유무)이 제각각일 수 있어 숫자만 비교합니다.
  const matched = (data ?? []).find((row) => digits(row.phone ?? "") === phone);
  if (!matched) {
    return { success: false, message: "일치하는 회원 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    loginId: maskLoginId(matched.login_id),
    joinedAt: matched.created_at?.slice(0, 10) ?? "",
  };
}

export type FindPasswordResult = { success: boolean; message: string };

export async function requestPasswordResetAction(input: {
  loginId: string;
  name: string;
  phone: string;
}): Promise<FindPasswordResult> {
  const loginId = input.loginId.trim();
  const name = input.name.trim();
  const phone = digits(input.phone);
  if (!loginId || !name || !phone) {
    return { success: false, message: "아이디·이름·휴대폰 번호를 모두 입력해주세요." };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("id, name, phone")
    .eq("login_id", loginId)
    .is("deleted_at", null)
    .maybeSingle();

  const ok = data && data.name === name && digits(data.phone ?? "") === phone;
  if (!ok) {
    return { success: false, message: "일치하는 회원 정보를 찾을 수 없습니다." };
  }

  // 비밀번호 재설정은 본인확인 수단(문자·메일)이 붙어야 안전합니다.
  // 그 연동 전까지는 상담 안내로 대신합니다 — 임의 발급은 하지 않습니다.
  return {
    success: true,
    message:
      "본인 확인이 완료되었습니다. 고객센터(02-2135-9249)로 연락 주시면 비밀번호 재설정을 도와드립니다.",
  };
}
