import type { PaymentMethod, PaymentStatus } from "@/types/database.types";

/**
 * 백오피스 "결제관리 > 선납결제"(`/admin/payments/prepayments`) 전용 타입입니다.
 *
 * 학생이 자격증 발급비를 미리 결제(계좌이체/현금 등, 관리자가 입금을 확인한 뒤 직접
 * 등록)한 내역을 관리합니다. 이후 학생이 프론트에서 자격증발급신청을 제출하면
 * `certificate-application.service.ts`가 사용 가능한(미사용/미삭제) 선납결제를 자동으로
 * 찾아 연결하고 `usedAt`/`certificateApplicationId`를 채웁니다.
 */
export type CertificatePrepaymentLinkedApplication = {
  id: string;
  certificateName: string;
  appliedAt: string;
};

export type CertificatePrepaymentListItem = {
  id: string;
  memberId: string;
  memberName: string;
  memberLoginId: string;
  memberPhone: string | null;
  courseId: string | null;
  courseName: string | null;
  certificateName: string;
  amount: number;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  usedAt: string | null;
  linkedApplication: CertificatePrepaymentLinkedApplication | null;
  memo: string | null;
  createdAt: string;
};

export type CertificatePrepaymentCourseOption = {
  id: string;
  name: string;
};

export type CertificatePrepaymentFormInput = {
  memberLoginId: string;
  courseId: string;
  certificateName: string;
  amount: number;
  paymentMethod: PaymentMethod | "";
  paymentStatus: PaymentStatus;
  paidAt: string;
  memo: string;
};

export type CertificatePrepaymentFormField = keyof CertificatePrepaymentFormInput;

export type CertificatePrepaymentMutationResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: CertificatePrepaymentFormField };

export type CertificatePrepaymentDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
