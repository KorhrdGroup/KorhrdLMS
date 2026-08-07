"use server";

import {
  consumeVerificationToken,
  digitsOnly,
  sendVerificationCode,
  verifyCode,
} from "@/features/korhrd/services/phone-verification.service";
import { hashPassword } from "@/lib/shared/password";
import { createClient } from "@/lib/supabase/server";

/**
 * 아이디 찾기 / 비밀번호 재설정 — 휴대폰 문자 인증(SENS) 기반.
 *
 * 흐름은 두 경우 모두 같습니다.
 *   1) 이름(·아이디)+휴대폰으로 회원을 먼저 찾고 → 인증번호 발송
 *   2) 인증번호 확인 → 1회용 토큰 발급
 *   3) 토큰으로 아이디 확인 / 새 비밀번호 설정
 *
 * 계정 존재 여부를 그대로 알려주면 회원 정보를 추측당할 수 있어, 실패 문구는
 * 항상 같습니다. 아이디는 문자 인증까지 끝낸 뒤에만 전체를 보여줍니다.
 */
const NOT_FOUND = "일치하는 회원 정보를 찾을 수 없습니다.";

/** 비밀번호 규칙은 회원가입·비밀번호 변경 화면과 같은 4~20자입니다. */
const MIN_PASSWORD = 4;
const MAX_PASSWORD = 20;

export type SimpleResult = { success: boolean; message: string };

/** 이름+휴대폰으로 회원을 찾습니다. 저장 형식(하이픈)이 제각각이라 숫자만 비교합니다. */
async function findMemberByNamePhone(name: string, phone: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("id, login_id, phone, created_at")
    .eq("name", name)
    .is("deleted_at", null);

  return (data ?? []).find((row) => digitsOnly(row.phone ?? "") === phone) ?? null;
}

// ───────────────────────── 아이디 찾기 ─────────────────────────

export async function requestFindIdCodeAction(input: {
  name: string;
  phone: string;
}): Promise<SimpleResult> {
  const name = input.name.trim();
  const phone = digitsOnly(input.phone);
  if (!name || !phone) {
    return { success: false, message: "이름과 휴대폰 번호를 모두 입력해주세요." };
  }

  if (!(await findMemberByNamePhone(name, phone))) {
    return { success: false, message: NOT_FOUND };
  }

  return sendVerificationCode(phone, "find_id");
}

export type VerifyResult =
  | { success: true; token: string }
  | { success: false; message: string };

export async function verifyFindIdCodeAction(input: {
  phone: string;
  code: string;
}): Promise<VerifyResult> {
  return verifyCode(input.phone, input.code, "find_id");
}

export type FindIdResult =
  | { success: true; loginId: string; joinedAt: string }
  | { success: false; message: string };

/** 문자 인증을 마친 사람에게만 아이디 전체를 보여줍니다(마스킹 없음). */
export async function completeFindIdAction(input: {
  token: string;
  name: string;
}): Promise<FindIdResult> {
  const consumed = await consumeVerificationToken(input.token, "find_id");
  if (!consumed.success) {
    return { success: false, message: consumed.message };
  }

  const member = await findMemberByNamePhone(input.name.trim(), consumed.phone);
  if (!member) {
    return { success: false, message: NOT_FOUND };
  }

  return {
    success: true,
    loginId: member.login_id,
    joinedAt: member.created_at?.slice(0, 10) ?? "",
  };
}

// ──────────────────────── 비밀번호 재설정 ────────────────────────

/** 아이디까지 함께 확인합니다. 아이디를 모르면 아이디 찾기가 먼저입니다. */
async function findMemberForReset(loginId: string, name: string, phone: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("id, name, phone")
    .eq("login_id", loginId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data || data.name !== name || digitsOnly(data.phone ?? "") !== phone) {
    return null;
  }
  return data;
}

export async function requestPasswordResetCodeAction(input: {
  loginId: string;
  name: string;
  phone: string;
}): Promise<SimpleResult> {
  const loginId = input.loginId.trim();
  const name = input.name.trim();
  const phone = digitsOnly(input.phone);
  if (!loginId || !name || !phone) {
    return { success: false, message: "아이디·이름·휴대폰 번호를 모두 입력해주세요." };
  }

  if (!(await findMemberForReset(loginId, name, phone))) {
    return { success: false, message: NOT_FOUND };
  }

  return sendVerificationCode(phone, "reset_password");
}

export async function verifyPasswordResetCodeAction(input: {
  phone: string;
  code: string;
}): Promise<VerifyResult> {
  return verifyCode(input.phone, input.code, "reset_password");
}

/** 인증 토큰 + 아이디·이름이 모두 맞을 때만 비밀번호를 바꿉니다. */
export async function resetPasswordAction(input: {
  token: string;
  loginId: string;
  name: string;
  password: string;
  passwordConfirm: string;
}): Promise<SimpleResult> {
  const password = input.password;
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    return {
      success: false,
      message: `비밀번호는 ${MIN_PASSWORD}~${MAX_PASSWORD}자로 입력해주세요.`,
    };
  }
  if (password !== input.passwordConfirm) {
    return { success: false, message: "비밀번호가 서로 일치하지 않습니다." };
  }

  const consumed = await consumeVerificationToken(input.token, "reset_password");
  if (!consumed.success) {
    return { success: false, message: consumed.message };
  }

  const member = await findMemberForReset(
    input.loginId.trim(),
    input.name.trim(),
    consumed.phone,
  );
  if (!member) {
    return { success: false, message: NOT_FOUND };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ password_hash: hashPassword(password) })
    .eq("id", member.id);

  if (error) {
    console.error("[find-account] 비밀번호 재설정 실패", error.message);
    return { success: false, message: "비밀번호 변경에 실패했습니다. 다시 시도해주세요." };
  }

  return { success: true, message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요." };
}
