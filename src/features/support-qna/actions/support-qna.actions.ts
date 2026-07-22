"use server";

import { revalidatePath } from "next/cache";

import {
  createSupportQna,
  type CreateSupportQnaResult,
} from "@/features/support-qna/services/support-qna.service";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/** 학생이 1:1 상담 글을 작성합니다. 세션의 회원 정보로 작성자를 결정합니다. */
export async function createSupportQnaAction(input: {
  title: string;
  content: string;
}): Promise<CreateSupportQnaResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "로그인 후 이용해주세요." };
  }

  const result = await createSupportQna({
    memberId: member.id,
    authorName: member.name,
    title: input.title,
    content: input.content,
  });

  if (result.success) {
    revalidatePath("/support/qna");
  }

  return result;
}
