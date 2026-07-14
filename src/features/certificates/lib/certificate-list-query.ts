import type {
  CertificateListQuery,
  CertificateQuickPeriod,
} from "@/features/certificates/types/certificate.types";
import { DEFAULT_PAGE_SIZE, parseListQuery } from "@/lib/shared/list-query";
import type { CertificateDeliveryStatus, CertificateKind } from "@/types/database.types";

export function createDefaultCertificateListQuery(): CertificateListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    certificateKind: "",
    quickPeriod: "",
    startDate: "",
    endDate: "",
    search: "",
    deliveryStatus: "",
  };
}

export function parseCertificateListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CertificateListQuery {
  const base = parseListQuery(searchParams);

  return {
    page: base.page,
    pageSize: base.pageSize,
    certificateKind: parseCertificateKind(searchParams.certificateKind),
    quickPeriod: parseQuickPeriod(searchParams.quickPeriod),
    startDate: parseStringParam(searchParams.startDate),
    endDate: parseStringParam(searchParams.endDate),
    search: parseStringParam(searchParams.search),
    deliveryStatus: parseDeliveryStatus(searchParams.deliveryStatus),
  };
}

export function buildCertificateListQueryString(
  params: Partial<CertificateListQuery>,
  base?: CertificateListQuery,
): string {
  const merged: CertificateListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    certificateKind: params.certificateKind ?? base?.certificateKind ?? "",
    quickPeriod: params.quickPeriod ?? base?.quickPeriod ?? "",
    startDate: params.startDate ?? base?.startDate ?? "",
    endDate: params.endDate ?? base?.endDate ?? "",
    search: params.search ?? base?.search ?? "",
    deliveryStatus: params.deliveryStatus ?? base?.deliveryStatus ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.certificateKind) query.set("certificateKind", merged.certificateKind);
  if (merged.quickPeriod) query.set("quickPeriod", merged.quickPeriod);
  if (merged.startDate) query.set("startDate", merged.startDate);
  if (merged.endDate) query.set("endDate", merged.endDate);
  if (merged.search) query.set("search", merged.search);
  if (merged.deliveryStatus) query.set("deliveryStatus", merged.deliveryStatus);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildCertificatePageHref(page: number, query: CertificateListQuery) {
  return `/admin/certificates/applications${buildCertificateListQueryString({ page }, query)}`;
}

export function buildCertificateExportHref(query: CertificateListQuery) {
  return `/admin/certificates/applications/export${buildCertificateListQueryString(
    { page: 1 },
    query,
  )}`;
}

export function resolveQuickPeriodRange(quickPeriod: CertificateQuickPeriod) {
  if (!quickPeriod) {
    return { startDate: "", endDate: "" };
  }

  const end = new Date();
  const start = new Date(end);

  switch (quickPeriod) {
    case "1w":
      start.setDate(start.getDate() - 7);
      break;
    case "1m":
      start.setMonth(start.getMonth() - 1);
      break;
    case "2m":
      start.setMonth(start.getMonth() - 2);
      break;
    case "3m":
      start.setMonth(start.getMonth() - 3);
      break;
    default:
      break;
  }

  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  };
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function parseCertificateKind(
  value: string | string[] | undefined,
): CertificateKind | "" {
  const raw = parseStringParam(value);

  if (
    raw === "social_worker" ||
    raw === "child_care" ||
    raw === "lifelong_educator" ||
    raw === "youth_instructor" ||
    raw === "health_educator"
  ) {
    return raw;
  }

  return "";
}

function parseQuickPeriod(value: string | string[] | undefined): CertificateQuickPeriod {
  const raw = parseStringParam(value);

  if (raw === "1w" || raw === "1m" || raw === "2m" || raw === "3m") {
    return raw;
  }

  return "";
}

function parseDeliveryStatus(
  value: string | string[] | undefined,
): CertificateDeliveryStatus | "" {
  const raw = parseStringParam(value);

  if (
    raw === "pending" ||
    raw === "preparing" ||
    raw === "shipped" ||
    raw === "delivered" ||
    raw === "canceled"
  ) {
    return raw;
  }

  return "";
}
