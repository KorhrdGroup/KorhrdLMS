import { CERTIFICATE_LIST_SELECT } from "@/features/certificates/constants";
import { resolveQuickPeriodRange } from "@/features/certificates/lib/certificate-list-query";
import type {
  CertificateListItem,
  CertificateListQuery,
} from "@/features/certificates/types/certificate.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";
import type {
  CertificateDeliveryStatus,
  CertificateKind,
  PaymentStatus,
} from "@/types/database.types";

type CertificateListRow = {
  id: string;
  certificate_kind: CertificateKind;
  certificate_name: string;
  member_login_id: string;
  applicant_name: string;
  phone: string | null;
  postal_code: string | null;
  address: string | null;
  address_detail: string | null;
  photo_url: string | null;
  issuance_cost: number;
  actual_payment_amount: number;
  payment_status: PaymentStatus;
  delivery_status: CertificateDeliveryStatus;
  applied_at: string;
  created_at: string;
};

function mapCertificateListItem(row: CertificateListRow): CertificateListItem {
  return {
    id: row.id,
    certificateKind: row.certificate_kind,
    certificateName: row.certificate_name,
    memberLoginId: row.member_login_id,
    applicantName: row.applicant_name,
    phone: row.phone,
    postalCode: row.postal_code,
    address: row.address,
    addressDetail: row.address_detail,
    photoUrl: row.photo_url,
    issuanceCost: row.issuance_cost,
    actualPaymentAmount: row.actual_payment_amount,
    paymentStatus: row.payment_status,
    deliveryStatus: row.delivery_status,
    appliedAt: row.applied_at,
    createdAt: row.created_at,
  };
}

function getEffectiveDateRange(query: CertificateListQuery) {
  if (query.startDate || query.endDate) {
    return {
      startDate: query.startDate,
      endDate: query.endDate,
    };
  }

  if (query.quickPeriod) {
    return resolveQuickPeriodRange(query.quickPeriod);
  }

  return { startDate: "", endDate: "" };
}

export function applyCertificateListFilters<
  T extends {
    eq: (column: string, value: string) => T;
    gte: (column: string, value: string) => T;
    lte: (column: string, value: string) => T;
    or: (filters: string) => T;
  },
>(builder: T, query: CertificateListQuery): T {
  const { startDate, endDate } = getEffectiveDateRange(query);

  if (query.certificateKind) {
    builder = builder.eq("certificate_kind", query.certificateKind);
  }

  if (query.deliveryStatus) {
    builder = builder.eq("delivery_status", query.deliveryStatus);
  }

  if (startDate) {
    builder = builder.gte("applied_at", startDate);
  }

  if (endDate) {
    builder = builder.lte("applied_at", endDate);
  }

  if (query.search) {
    const keyword = `%${query.search}%`;
    builder = builder.or(
      `applicant_name.ilike.${keyword},member_login_id.ilike.${keyword},phone.ilike.${keyword}`,
    );
  }

  return builder;
}

export async function getCertificateList(
  query: CertificateListQuery,
): Promise<PaginatedResult<CertificateListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("certificate_applications")
    .select(CERTIFICATE_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("applied_at", { ascending: false })
    .order("created_at", { ascending: false });

  builder = applyCertificateListFilters(builder, query);

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CertificateListRow[];
  const total = count ?? 0;

  return {
    data: rows.map(mapCertificateListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}
