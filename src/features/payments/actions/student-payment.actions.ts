"use server";

import {
  cancelPayment,
  confirmPayment,
  createPayment,
} from "@/features/payments/services/payment.service";
import type {
  CancelPaymentResult,
  ConfirmPaymentResult,
  CreatePaymentResult,
} from "@/features/payments/types/payment.types";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * 학생 결제 화면에서 호출하는 Server Action 모음입니다.
 * 로그인 세션에서 회원을 직접 조회하므로, 클라이언트가 memberId를 조작해 전달할 수 없습니다.
 * (학생 페이지는 이 Server Action을 통해서만 결제 데이터를 생성/변경합니다.)
 */
export async function createPaymentAction(input: {
  courseId: string;
  classId: string;
}): Promise<CreatePaymentResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return {
      success: false,
      code: "member_not_found",
      message: "결제를 진행하려면 로그인이 필요합니다.",
    };
  }

  return createPayment({
    memberId: member.id,
    courseId: input.courseId,
    classId: input.classId,
  });
}

/**
 * 실제 PG 연동 전 개발/테스트용 "결제 성공 처리" 액션입니다.
 * 실제 PG 콜백/웹훅이 붙으면 이 액션 대신 서버 라우트에서 confirmPayment()를 호출하면 됩니다.
 */
export async function confirmPaymentTestAction(input: {
  paymentId: string;
}): Promise<ConfirmPaymentResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return {
      success: false,
      code: "forbidden",
      message: "결제를 진행하려면 로그인이 필요합니다.",
    };
  }

  return confirmPayment({
    paymentId: input.paymentId,
    memberId: member.id,
    pgProvider: "dev_test",
  });
}

export async function cancelPaymentAction(input: {
  paymentId: string;
}): Promise<CancelPaymentResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "결제를 진행하려면 로그인이 필요합니다." };
  }

  return cancelPayment({ paymentId: input.paymentId, memberId: member.id });
}
