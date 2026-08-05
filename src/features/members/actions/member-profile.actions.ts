"use server";

import { revalidatePath } from "next/cache";

import {
  updateMyProfile,
  type MemberProfileInput,
  type MemberProfileUpdateResult,
} from "@/features/members/services/member-profile.service";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * 본인 회원정보 저장.
 *
 * memberId를 인자로 받지 않는 것이 핵심입니다 — 세션에서 직접 읽어야 다른 회원의
 * id를 넣어 남의 정보를 고치는 일이 생기지 않습니다.
 * (관리자용 `updateMemberAction`은 id를 받으므로 학생 화면에서 쓰면 안 됩니다)
 */
export async function updateMyProfileAction(
  input: MemberProfileInput,
): Promise<MemberProfileUpdateResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const result = await updateMyProfile(member.id, input);

  if (result.success) {
    // 나의 강의실 마이페이지 탭도 같은 값을 보여주므로 함께 갱신합니다.
    revalidatePath("/mylecture");
    revalidatePath("/mypage");
  }

  return result;
}
