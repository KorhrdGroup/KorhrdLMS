import type {
  CertificateDeliveryStatus,
  CertificateKind,
  PaymentMethod,
  PaymentStatus,
} from "@/types/database.types";

export type CertificateQuickPeriod = "" | "1w" | "1m" | "2m" | "3m";

export type CertificateListQuery = {
  page: number;
  pageSize: number;
  certificateKind: CertificateKind | "";
  /** 자격증명(certificate_name) 필터 — 빈 값이면 전체 */
  certName: string;
  quickPeriod: CertificateQuickPeriod;
  startDate: string;
  endDate: string;
  search: string;
  /** 상단 메뉴 "발급신청"/"승인관리" 바로가기(예: `?deliveryStatus=pending`)를 위한 선택적 필터입니다. */
  deliveryStatus: CertificateDeliveryStatus | "";
};

export type CertificateListItem = {
  id: string;
  certificateKind: CertificateKind;
  certificateName: string;
  memberLoginId: string;
  applicantName: string;
  phone: string | null;
  postalCode: string | null;
  address: string | null;
  addressDetail: string | null;
  photoUrl: string | null;
  /** 사진 없이 발급 확정 여부 */
  issueWithoutPhoto: boolean;
  issuanceCost: number;
  actualPaymentAmount: number;
  /** 결제방법. null 이면 무통장입금 안내 상태입니다. */
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  deliveryStatus: CertificateDeliveryStatus;
  appliedAt: string;
  createdAt: string;
  /** 관리자 상단 고정 시각. null 이면 고정 안 됨 */
  pinnedAt: string | null;
};

export type CertificateDetail = {
  id: string;
  certificateKind: CertificateKind;
  certificateName: string;
  memberLoginId: string;
  applicantName: string;
  phone: string | null;
  birthDate: string | null;
  postalCode: string | null;
  address: string | null;
  addressDetail: string | null;
  photoUrl: string | null;
  /** 사진 없이 발급 확정 여부 */
  issueWithoutPhoto: boolean;
  issuanceCost: number;
  actualPaymentAmount: number;
  paymentMethod: PaymentMethod | null;
  paymentInfo: string | null;
  paymentStatus: PaymentStatus;
  /** PayApp 결제완료 통보를 받은 시각. 무통장입금 등 수기 확인 건은 null입니다. */
  paidAt: string | null;
  /** PayApp 결제요청번호(mul_no). 정산 대사할 때 PayApp 관리자와 대조하는 값입니다. */
  payappMulNo: string | null;
  deliveryStatus: CertificateDeliveryStatus;
  memo: string | null;
  appliedAt: string;
  issuedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetCertificateDetailResult =
  | { success: true; application: CertificateDetail }
  | { success: false; message: string };

export type CertificateExportRow = {
  certificateKind: CertificateKind;
  certificateName: string;
  memberLoginId: string;
  applicantName: string;
  phone: string | null;
  fullAddress: string;
  issuanceCost: number;
  actualPaymentAmount: number;
  paymentMethodLabel: string;
  paymentInfo: string | null;
  deliveryStatusLabel: string;
  memo: string | null;
  appliedAt: string;
};
