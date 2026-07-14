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
  issuanceCost: number;
  actualPaymentAmount: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: CertificateDeliveryStatus;
  appliedAt: string;
  createdAt: string;
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
  issuanceCost: number;
  actualPaymentAmount: number;
  paymentMethod: PaymentMethod | null;
  paymentInfo: string | null;
  paymentStatus: PaymentStatus;
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
