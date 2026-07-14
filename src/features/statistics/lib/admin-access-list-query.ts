import type {
  AdminAccessListQuery,
  AdminAccessQuickPeriod,
} from "@/features/statistics/types/admin-access.types";
import { DEFAULT_PAGE_SIZE, parseListQuery } from "@/lib/shared/list-query";
import type { AdminType } from "@/types/database.types";

export function createDefaultAdminAccessListQuery(): AdminAccessListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    adminType: "",
    quickPeriod: "",
    startDate: "",
    endDate: "",
    adminName: "",
  };
}

export function parseAdminAccessListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): AdminAccessListQuery {
  const base = parseListQuery(searchParams);

  return {
    page: base.page,
    pageSize: base.pageSize,
    adminType: parseAdminType(searchParams.adminType),
    quickPeriod: parseQuickPeriod(searchParams.quickPeriod),
    startDate: parseStringParam(searchParams.startDate),
    endDate: parseStringParam(searchParams.endDate),
    adminName: parseStringParam(searchParams.adminName),
  };
}

export function buildAdminAccessListQueryString(
  params: Partial<AdminAccessListQuery>,
  base?: AdminAccessListQuery,
): string {
  const merged: AdminAccessListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    adminType: params.adminType ?? base?.adminType ?? "",
    quickPeriod: params.quickPeriod ?? base?.quickPeriod ?? "",
    startDate: params.startDate ?? base?.startDate ?? "",
    endDate: params.endDate ?? base?.endDate ?? "",
    adminName: params.adminName ?? base?.adminName ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.adminType) query.set("adminType", merged.adminType);
  if (merged.quickPeriod) query.set("quickPeriod", merged.quickPeriod);
  if (merged.startDate) query.set("startDate", merged.startDate);
  if (merged.endDate) query.set("endDate", merged.endDate);
  if (merged.adminName) query.set("adminName", merged.adminName);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildAdminAccessPageHref(page: number, query: AdminAccessListQuery) {
  return `/admin/statistics/admin-access${buildAdminAccessListQueryString({ page }, query)}`;
}

export function resolveQuickPeriodRange(quickPeriod: AdminAccessQuickPeriod) {
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

export function getEffectiveDateRange(query: AdminAccessListQuery) {
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

function parseAdminType(value: string | string[] | undefined): AdminType | "" {
  const raw = parseStringParam(value);

  if (
    raw === "super_admin" ||
    raw === "admin" ||
    raw === "instructor" ||
    raw === "counselor"
  ) {
    return raw;
  }

  return "";
}

function parseQuickPeriod(value: string | string[] | undefined): AdminAccessQuickPeriod {
  const raw = parseStringParam(value);

  if (raw === "1w" || raw === "1m" || raw === "2m" || raw === "3m") {
    return raw;
  }

  return "";
}

function toEndOfDayIso(date: string) {
  return `${date}T23:59:59.999+09:00`;
}

function toStartOfDayIso(date: string) {
  return `${date}T00:00:00.000+09:00`;
}

export function getAccessLogDateRange(query: AdminAccessListQuery) {
  const { startDate, endDate } = getEffectiveDateRange(query);

  return {
    startAt: startDate ? toStartOfDayIso(startDate) : "",
    endAt: endDate ? toEndOfDayIso(endDate) : "",
  };
}
