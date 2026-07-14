import type { CertificatePrepaymentUsageFilter } from "@/features/certificate-prepayments/constants";
import {
  buildListQueryString,
  DEFAULT_PAGE_SIZE,
  parseListQuery,
  type ListQuery,
} from "@/lib/shared/list-query";

export type CertificatePrepaymentListQuery = ListQuery & {
  usage: CertificatePrepaymentUsageFilter;
};

function isUsageFilter(value: string | undefined): value is CertificatePrepaymentUsageFilter {
  return value === "all" || value === "used" || value === "available";
}

export function parseCertificatePrepaymentListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CertificatePrepaymentListQuery {
  const base = parseListQuery(searchParams, { pageSize: DEFAULT_PAGE_SIZE });
  const rawUsage = Array.isArray(searchParams.usage) ? searchParams.usage[0] : searchParams.usage;

  return {
    ...base,
    usage: isUsageFilter(rawUsage) ? rawUsage : "all",
  };
}

/**
 * 선납결제 화면 URL입니다. "자격증신청" 소메뉴가 아니라 "결제관리" 소메뉴에
 * 속하므로 `/admin/payments/prepayments`를 사용합니다(구 URL
 * `/admin/certificates/prepayments`는 이 경로로 redirect됩니다).
 */
export function buildCertificatePrepaymentPageHref(
  page: number,
  query: CertificatePrepaymentListQuery,
): string {
  return `/admin/payments/prepayments${buildCertificatePrepaymentQueryString({ page }, query)}`;
}

export function buildCertificatePrepaymentQueryString(
  next: Partial<CertificatePrepaymentListQuery>,
  base: CertificatePrepaymentListQuery,
): string {
  const merged: CertificatePrepaymentListQuery = {
    ...base,
    ...next,
  };

  const qs = buildListQueryString(merged, base);
  const params = new URLSearchParams(qs.replace(/^\?/, ""));

  if (merged.usage !== "all") {
    params.set("usage", merged.usage);
  } else {
    params.delete("usage");
  }

  const result = params.toString();
  return result ? `?${result}` : "";
}
