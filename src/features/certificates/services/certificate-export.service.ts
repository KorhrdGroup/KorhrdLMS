import { CERTIFICATE_EXPORT_SELECT } from "@/features/certificates/constants";
import {
  formatFullAddress,
  getCertificateDeliveryStatusLabel,
  getCertificateKindLabel,
} from "@/features/certificates/lib/certificate.utils";
import { applyCertificateListFilters } from "@/features/certificates/services/certificate-list.service";
import type {
  CertificateExportRow,
  CertificateListQuery,
} from "@/features/certificates/types/certificate.types";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  CertificateDeliveryStatus,
  CertificateKind,
  PaymentMethod,
} from "@/types/database.types";

type CertificateExportDbRow = {
  certificate_kind: CertificateKind;
  certificate_name: string;
  member_login_id: string;
  applicant_name: string;
  phone: string | null;
  postal_code: string | null;
  address: string | null;
  address_detail: string | null;
  issuance_cost: number;
  actual_payment_amount: number;
  payment_method: PaymentMethod | null;
  payment_info: string | null;
  delivery_status: CertificateDeliveryStatus;
  memo: string | null;
  applied_at: string;
};

function getPaymentMethodLabel(method: PaymentMethod | null) {
  if (!method) {
    return "—";
  }

  return PAYMENT_METHOD_LABELS[method];
}

function mapExportRow(row: CertificateExportDbRow): CertificateExportRow {
  return {
    certificateKind: row.certificate_kind,
    certificateName: row.certificate_name,
    memberLoginId: row.member_login_id,
    applicantName: row.applicant_name,
    phone: row.phone,
    fullAddress: formatFullAddress(row.postal_code, row.address, row.address_detail),
    issuanceCost: row.issuance_cost,
    actualPaymentAmount: row.actual_payment_amount,
    paymentMethodLabel: getPaymentMethodLabel(row.payment_method),
    paymentInfo: row.payment_info,
    deliveryStatusLabel: getCertificateDeliveryStatusLabel(row.delivery_status),
    memo: row.memo,
    appliedAt: row.applied_at,
  };
}

function escapeCsvValue(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export async function getCertificateExportRows(
  query: CertificateListQuery,
): Promise<CertificateExportRow[]> {
  const supabase = await createClient();

  let builder = supabase
    .from("certificate_applications")
    .select(CERTIFICATE_EXPORT_SELECT)
    .is("deleted_at", null)
    .order("applied_at", { ascending: false })
    .order("created_at", { ascending: false });

  builder = applyCertificateListFilters(builder, query);

  const { data, error } = await builder;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CertificateExportDbRow[]).map(mapExportRow);
}

export async function buildCertificateExportCsv(query: CertificateListQuery) {
  const rows = await getCertificateExportRows(query);
  const headers = [
    "신청일",
    "자격증종류",
    "자격증명",
    "아이디",
    "이름",
    "연락처",
    "주소",
    "발급비용",
    "실결제금액",
    "결제방법",
    "결제정보",
    "배송상태",
    "메모",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.appliedAt,
        getCertificateKindLabel(row.certificateKind),
        row.certificateName,
        row.memberLoginId,
        row.applicantName,
        row.phone ?? "",
        row.fullAddress === "—" ? "" : row.fullAddress,
        row.issuanceCost,
        row.actualPaymentAmount,
        row.paymentMethodLabel === "—" ? "" : row.paymentMethodLabel,
        row.paymentInfo ?? "",
        row.deliveryStatusLabel,
        row.memo ?? "",
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  return `\uFEFF${lines.join("\n")}`;
}
