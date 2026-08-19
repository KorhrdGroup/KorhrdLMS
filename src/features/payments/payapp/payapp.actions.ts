"use server";

import {
  startCertificatePayment,
  type StartPaymentResult,
} from "@/features/payments/payapp/payapp.service";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * 자격증 발급비 결제창 열기.
 *
 * 신청 건 id만 받고 회원은 세션에서 읽습니다 — 남의 신청 건으로 결제창을
 * 여는 일이 없어야 하기 때문입니다. 금액도 서버가 DB에서 다시 읽습니다.
 */
export async function startCertificatePaymentAction(
  /** 한 건(id) 또는 이번에 같이 결제할 여러 건(id 배열) */
  applicationIds: string | string[],
): Promise<StartPaymentResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const ids = Array.isArray(applicationIds) ? applicationIds : [applicationIds];
  return startCertificatePayment(member.id, ids);
}
