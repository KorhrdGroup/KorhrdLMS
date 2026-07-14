import type {
  CoursePaymentStatus,
  PaymentMethod,
} from "@/types/database.types";

export type SubjectPaymentQuickPeriod = "" | "1w" | "1m" | "2m" | "3m";

export type SubjectPaymentListQuery = {
  page: number;
  pageSize: number;
  paymentMethod: PaymentMethod | "";
  status: CoursePaymentStatus | "";
  quickPeriod: SubjectPaymentQuickPeriod;
  startDate: string;
  endDate: string;
  memberName: string;
};

export type SubjectPaymentListItem = {
  id: string;
  paymentDate: string;
  memberName: string;
  memberLoginId: string;
  couponNumber: string | null;
  courseName: string;
  assignedInstructor: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  couponApplied: boolean;
  status: CoursePaymentStatus;
  /** PG 연동 시 결제대행사 식별자 (예: toss, dev_test). 관리자 수기입력 결제는 null */
  pgProvider: string | null;
  /** PG 전달용 자체 채번 주문번호 */
  pgOrderId: string | null;
  enrollmentId: string | null;
  createdAt: string;
};

export type SubjectPaymentDetail = {
  id: string;
  paymentNumber: string;
  productName: string;
  paymentDate: string;
  memberName: string;
  memberLoginId: string;
  memberPhone: string | null;
  depositBank: string | null;
  depositorName: string | null;
  virtualAccountNumber: string | null;
  classPeriodStart: string | null;
  classPeriodEnd: string | null;
  shippingAddress: string | null;
  approvedAt: string | null;
  canceledAt: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  status: CoursePaymentStatus;
  memo: string | null;
  pgProvider: string | null;
  pgOrderId: string | null;
  pgTransactionId: string | null;
  failedReason: string | null;
};

export type GetSubjectPaymentDetailResult =
  | { success: true; payment: SubjectPaymentDetail }
  | { success: false; message: string };
