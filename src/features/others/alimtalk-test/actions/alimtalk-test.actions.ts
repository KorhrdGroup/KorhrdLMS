"use server";

import { cookies } from "next/headers";

import { ADMIN_SESSION_MARKER_COOKIE } from "@/features/admin-auth/constants";
import {
  ALIMTALK_TEMPLATES,
  sendAlimtalk,
  type AlimtalkTemplateKey,
} from "@/lib/aligo/alimtalk";

export type AlimtalkTestResult = { success: boolean; message: string };

/** 어드민 알림톡 테스트 발송 — 관리자만, 등록된 템플릿으로만 보냅니다 */
export async function sendAlimtalkTestAction(input: {
  template: AlimtalkTemplateKey;
  receiver: string;
  vars: Record<string, string>;
}): Promise<AlimtalkTestResult> {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_SESSION_MARKER_COOKIE)) {
    return { success: false, message: "관리자만 사용할 수 있습니다." };
  }

  if (!(input.template in ALIMTALK_TEMPLATES)) {
    return { success: false, message: "알 수 없는 템플릿입니다." };
  }

  const receiver = input.receiver.replace(/\D/g, "");
  if (receiver.length < 10) {
    return { success: false, message: "수신번호를 확인해주세요." };
  }

  const result = await sendAlimtalk({
    receivers: receiver,
    template: input.template,
    vars: input.vars,
  });

  return result.success
    ? { success: true, message: "발송 요청을 보냈습니다. 카카오톡을 확인해주세요." }
    : { success: false, message: result.message };
}
