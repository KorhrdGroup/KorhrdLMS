import type { CoursePaymentStatus, PaymentMethod } from "@/types/database.types";

/**
 * 학생 결제 화면(체크아웃)에 필요한 결제 1건 요약 정보.
 * `course_payments` 테이블을 그대로 노출하지 않고 화면에 필요한 값만 전달합니다.
 */
export type CoursePaymentSummary = {
  id: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  classId: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  status: CoursePaymentStatus;
  pgProvider: string | null;
  pgOrderId: string | null;
  failedReason: string | null;
  createdAt: string;
};

export type CreatePaymentInput = {
  memberId: string;
  courseId: string;
  classId: string;
};

export type CreatePaymentErrorCode =
  | "member_not_found"
  | "course_not_found"
  | "class_not_found"
  | "class_closed"
  | "already_enrolled"
  | "unknown";

export type CreatePaymentResult =
  | { success: true; payment: CoursePaymentSummary; reused: boolean }
  | { success: false; code: CreatePaymentErrorCode; message: string };

export type ConfirmPaymentInput = {
  paymentId: string;
  memberId: string;
  /** 실제 PG 연동 시 PG사가 콜백으로 전달하는 값들. 개발 테스트 버튼은 생략 가능(dev_test로 대체). */
  pgProvider?: string;
  pgTransactionId?: string;
};

export type ConfirmPaymentErrorCode =
  | "payment_not_found"
  | "forbidden"
  | "already_terminated"
  | "class_not_found"
  | "unknown";

export type ConfirmPaymentResult =
  | {
      success: true;
      payment: CoursePaymentSummary;
      enrollmentId: string;
      alreadyPaid: boolean;
    }
  | { success: false; code: ConfirmPaymentErrorCode; message: string };

export type FailPaymentInput = {
  paymentId: string;
  memberId?: string;
  reason?: string;
};

export type FailPaymentResult =
  | { success: true; payment: CoursePaymentSummary }
  | { success: false; message: string };

export type CancelPaymentInput = {
  paymentId: string;
  memberId?: string;
  reason?: string;
};

export type CancelPaymentResult =
  | { success: true; payment: CoursePaymentSummary }
  | { success: false; message: string };

export type RefundPaymentInput = {
  paymentId: string;
  reason?: string;
};

export type RefundPaymentResult =
  | { success: true; payment: CoursePaymentSummary }
  | { success: false; message: string };
