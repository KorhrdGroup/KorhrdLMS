import type {
  SubjectPaymentListQuery,
  SubjectPaymentQuickPeriod,
} from "@/features/payments/types/subject-payment.types";
import {
  DEFAULT_PAGE_SIZE,
  parseListQuery,
} from "@/lib/shared/list-query";
import type { CoursePaymentStatus, PaymentMethod } from "@/types/database.types";

export function createDefaultSubjectPaymentListQuery(): SubjectPaymentListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    paymentMethod: "",
    status: "",
    quickPeriod: "",
    startDate: "",
    endDate: "",
    memberName: "",
  };
}

export function parseSubjectPaymentListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): SubjectPaymentListQuery {
  const base = parseListQuery(searchParams);

  return {
    page: base.page,
    pageSize: base.pageSize,
    paymentMethod: parsePaymentMethod(searchParams.paymentMethod),
    status: parsePaymentStatus(searchParams.status),
    quickPeriod: parseQuickPeriod(searchParams.quickPeriod),
    startDate: parseStringParam(searchParams.startDate),
    endDate: parseStringParam(searchParams.endDate),
    memberName: parseStringParam(searchParams.memberName),
  };
}

export function buildSubjectPaymentListQueryString(
  params: Partial<SubjectPaymentListQuery>,
  base?: SubjectPaymentListQuery,
): string {
  const merged: SubjectPaymentListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    paymentMethod: params.paymentMethod ?? base?.paymentMethod ?? "",
    status: params.status ?? base?.status ?? "",
    quickPeriod: params.quickPeriod ?? base?.quickPeriod ?? "",
    startDate: params.startDate ?? base?.startDate ?? "",
    endDate: params.endDate ?? base?.endDate ?? "",
    memberName: params.memberName ?? base?.memberName ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.paymentMethod) query.set("paymentMethod", merged.paymentMethod);
  if (merged.status) query.set("status", merged.status);
  if (merged.quickPeriod) query.set("quickPeriod", merged.quickPeriod);
  if (merged.startDate) query.set("startDate", merged.startDate);
  if (merged.endDate) query.set("endDate", merged.endDate);
  if (merged.memberName) query.set("memberName", merged.memberName);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildSubjectPaymentPageHref(
  page: number,
  query: SubjectPaymentListQuery,
) {
  return `/admin/payments/subjects${buildSubjectPaymentListQueryString({ page }, query)}`;
}

export function resolveQuickPeriodRange(quickPeriod: SubjectPaymentQuickPeriod) {
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

function parsePaymentMethod(value: string | string[] | undefined): PaymentMethod | "" {
  const raw = parseStringParam(value);

  if (
    raw === "card" ||
    raw === "bank_transfer" ||
    raw === "virtual_account" ||
    raw === "mobile" ||
    raw === "cash"
  ) {
    return raw;
  }

  return "";
}

function parsePaymentStatus(
  value: string | string[] | undefined,
): CoursePaymentStatus | "" {
  const raw = parseStringParam(value);

  if (
    raw === "ready" ||
    raw === "pending" ||
    raw === "paid" ||
    raw === "failed" ||
    raw === "canceled" ||
    raw === "refunded"
  ) {
    return raw;
  }

  return "";
}

function parseQuickPeriod(
  value: string | string[] | undefined,
): SubjectPaymentQuickPeriod {
  const raw = parseStringParam(value);

  if (raw === "1w" || raw === "1m" || raw === "2m" || raw === "3m") {
    return raw;
  }

  return "";
}
