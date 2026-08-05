import { hashPassword, verifyPassword } from "@/lib/shared/password";
import { createClient } from "@/lib/supabase/server";

/**
 * 학생 본인 비밀번호 변경(`/mypage/password`).
 *
 * 학생 인증은 Supabase Auth가 아니라 `members.password_hash`(scrypt) + httpOnly
 * 쿠키 세션이라, 로그인과 같은 `verifyPassword`로 현재 비밀번호를 직접 확인합니다.
 * 회원가입(`member-registration.service.ts`)과 동일하게 `hashPassword`로 저장합니다.
 */
export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export type ChangePasswordResult =
  | { success: true }
  | { success: false; message: string; field?: keyof ChangePasswordInput };

/** 회원가입 화면과 같은 기준(4~20자)입니다. */
const MIN_LENGTH = 4;
const MAX_LENGTH = 20;

export async function changeMyPassword(
  memberId: string,
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  if (!memberId.trim()) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  if (!input.currentPassword) {
    return {
      success: false,
      message: "현재 비밀번호를 입력해주세요.",
      field: "currentPassword",
    };
  }

  const newPassword = input.newPassword;

  if (newPassword.length < MIN_LENGTH || newPassword.length > MAX_LENGTH) {
    return {
      success: false,
      message: `새 비밀번호는 ${MIN_LENGTH}~${MAX_LENGTH}자로 입력해주세요.`,
      field: "newPassword",
    };
  }

  if (newPassword !== input.newPasswordConfirm) {
    return {
      success: false,
      message: "새 비밀번호가 서로 일치하지 않습니다.",
      field: "newPasswordConfirm",
    };
  }

  if (newPassword === input.currentPassword) {
    return {
      success: false,
      message: "현재 비밀번호와 다른 비밀번호로 설정해주세요.",
      field: "newPassword",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("password_hash")
    .eq("id", memberId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const storedHash = (data as { password_hash: string | null } | null)?.password_hash;

  if (!storedHash || !verifyPassword(input.currentPassword, storedHash)) {
    return {
      success: false,
      message: "현재 비밀번호가 올바르지 않습니다.",
      field: "currentPassword",
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from("members")
    .update({ password_hash: hashPassword(newPassword) })
    .eq("id", memberId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!updated) {
    return { success: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  return { success: true };
}
