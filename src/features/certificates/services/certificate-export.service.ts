import ExcelJS from "exceljs";

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

/**
 * "2026-07-24" → "2026년 7월 24일".
 * xlsx 에서는 글자(텍스트) 셀로 넣으므로 엑셀이 날짜로 바꾸지 못하고,
 * 열 너비도 파일에 넣어 두어 ###### 으로 보일 일이 없습니다.
 */
function formatAppliedAtKorean(appliedAt: string) {
  const [y, m, d] = appliedAt.split("-").map(Number);
  if (!y || !m || !d) return appliedAt;
  return `${y}년 ${m}월 ${d}일`;
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
    .order("created_at", { ascending: false })
    /* 목록 화면과 같은 순서 — 이관분은 created_at 이 같아 legacy_no 로 갈라야 합니다 */
    .order("legacy_no", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  builder = applyCertificateListFilters(builder, query);

  const { data, error } = await builder;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CertificateExportDbRow[]).map(mapExportRow);
}

/** 자격증신청 목록을 실제 엑셀 파일(.xlsx)로 만들어 base64 로 돌려줍니다. */
export async function buildCertificateExportXlsx(query: CertificateListQuery) {
  const rows = await getCertificateExportRows(query);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("자격증신청");

  /* 열 너비를 파일에 넣어 두므로 ###### 으로 보일 일이 없습니다 */
  sheet.columns = [
    { header: "신청일", key: "appliedAt", width: 16 },
    { header: "자격증종류", key: "kind", width: 12 },
    { header: "자격증명", key: "name", width: 22 },
    { header: "아이디", key: "loginId", width: 16 },
    { header: "이름", key: "applicant", width: 10 },
    { header: "연락처", key: "phone", width: 15 },
    { header: "주소", key: "address", width: 46 },
    { header: "발급비용", key: "cost", width: 10 },
    { header: "실결제금액", key: "paid", width: 11 },
    { header: "결제방법", key: "method", width: 10 },
    { header: "결제정보", key: "paymentInfo", width: 14 },
    { header: "배송상태", key: "delivery", width: 10 },
    { header: "메모", key: "memo", width: 24 },
  ];

  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    sheet.addRow({
      appliedAt: formatAppliedAtKorean(row.appliedAt),
      kind: getCertificateKindLabel(row.certificateKind),
      name: row.certificateName,
      loginId: row.memberLoginId,
      applicant: row.applicantName,
      phone: row.phone ?? "",
      address: row.fullAddress === "—" ? "" : row.fullAddress,
      cost: row.issuanceCost,
      paid: row.actualPaymentAmount,
      method: row.paymentMethodLabel === "—" ? "" : row.paymentMethodLabel,
      paymentInfo: row.paymentInfo ?? "",
      delivery: row.deliveryStatusLabel,
      memo: row.memo ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer).toString("base64");
}
