import type {
  CertificateDeliveryStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/database.types";

/**
 * 학생 "자격증발급신청" 화면(`/certificate/apply`) 전용 타입 정의입니다.
 *
 * 수료 판정은 관리자 수료증관리/학습강의실 수료증과 동일한
 * `computeCompletionEligibility`를 그대로 재사용해 기준이 항상 일치하도록 합니다.
 */
export type EligibleCertificateCourse = {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  /** 이미 신청한 자격증(취소되지 않은 건)이 있으면 true — select에서 비활성화 처리합니다. */
  alreadyApplied: boolean;
  /** alreadyApplied가 true일 때, 신청 내역 조회로 바로 이동할 수 있도록 함께 내려줍니다. */
  applicationId: string | null;
  /**
   * 이 과정으로 자격증발급신청 시 자동 반영될 선납결제 금액(원)입니다. 사용 가능한
   * 선납결제가 없으면 0입니다 — `certificate-prepayments` 기능의
   * `findAvailableCertificatePrepayment`로 조회하며, 실제 제출 시 연결되는 건과 동일한
   * 기준(과정 일치 우선, 없으면 과정 무관 선납)으로 찾습니다.
   */
  prepaymentAmount: number;
};

export type ApplicantProfile = {
  name: string;
  birthDate: string | null;
  phone: string | null;
  postalCode: string | null;
  address: string | null;
  addressDetail: string | null;
};

export type CertificateApplicationPageData = {
  profile: ApplicantProfile;
  eligibleCourses: EligibleCertificateCourse[];
  issuanceCost: number;
};

export type SubmitCertificateApplicationInput = {
  courseId: string;
  deliveryName: string;
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  memo: string;
  photoUrl: string;
  paymentMethod: PaymentMethod;
};

export type SubmitCertificateApplicationFieldError = keyof SubmitCertificateApplicationInput;

export type SubmitCertificateApplicationResult =
  | { success: true; applicationId: string; message: string }
  | {
      success: false;
      code: "not_logged_in" | "not_eligible" | "already_applied" | "validation_error" | "unknown";
      message: string;
      field?: SubmitCertificateApplicationFieldError;
    };

export type MyCertificateApplicationItem = {
  id: string;
  appliedAt: string;
  certificateName: string;
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  deliveryStatus: CertificateDeliveryStatus;
  deliveryStatusLabel: string;
  fullAddress: string;
  issuedAt: string | null;
};
