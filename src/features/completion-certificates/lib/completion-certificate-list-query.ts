import { CERTIFICATE_SEARCH_FIELD_LABELS } from "@/features/completion-certificates/constants";
import type {
  CertificateSearchField,
  CertificateStatusFilter,
  CompletionCertificateListQuery,
} from "@/features/completion-certificates/types/completion-certificate.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/list-query";

const STATUS_FILTER_VALUES: CertificateStatusFilter[] = ["all", "issued", "not_issued"];

export function parseCompletionCertificateListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CompletionCertificateListQuery {
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const rawPageSize = Array.isArray(searchParams.pageSize)
    ? searchParams.pageSize[0]
    : searchParams.pageSize;
  const rawSearch = Array.isArray(searchParams.search) ? searchParams.search[0] : searchParams.search;
  const rawField = Array.isArray(searchParams.field) ? searchParams.field[0] : searchParams.field;
  const rawStatus = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;

  return {
    page: Math.max(1, Number(rawPage) || 1),
    pageSize: Number(rawPageSize) || DEFAULT_PAGE_SIZE,
    search: (rawSearch ?? "").trim(),
    field: isCertificateSearchField(rawField) ? rawField : "all",
    status: isStatusFilter(rawStatus) ? rawStatus : "all",
  };
}

export function buildCompletionCertificateListQueryString(
  params: Partial<CompletionCertificateListQuery>,
  base?: CompletionCertificateListQuery,
): string {
  const merged: CompletionCertificateListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    field: params.field ?? base?.field ?? "all",
    status: params.status ?? base?.status ?? "all",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) query.set("pageSize", String(merged.pageSize));
  if (merged.search) query.set("search", merged.search);
  if (merged.field !== "all") query.set("field", merged.field);
  if (merged.status !== "all") query.set("status", merged.status);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildCompletionCertificatePageHref(
  page: number,
  query: CompletionCertificateListQuery,
) {
  return `/admin/certificates${buildCompletionCertificateListQueryString({ page }, query)}`;
}

function isCertificateSearchField(value: string | undefined): value is CertificateSearchField {
  return !!value && Object.prototype.hasOwnProperty.call(CERTIFICATE_SEARCH_FIELD_LABELS, value);
}

function isStatusFilter(value: string | undefined): value is CertificateStatusFilter {
  return !!value && (STATUS_FILTER_VALUES as string[]).includes(value);
}
