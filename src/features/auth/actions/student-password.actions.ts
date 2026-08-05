"use server";

import {
  changeMyPassword,
  type ChangePasswordInput,
  type ChangePasswordResult,
} from "@/features/auth/services/student-password.service";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * 본인 비밀번호 변경. 대상 회원은 인자가 아니라 세션에서 읽습니다
 * (id를 받으면 남의 비밀번호를 바꿀 수 있게 되므로).
 */
export async function changeMyPasswordAction(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  return changeMyPassword(member.id, input);
}
