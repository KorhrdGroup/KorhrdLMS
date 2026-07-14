import type {
  MessageDispatchListQuery,
  MessageQuickPeriod,
} from "@/features/others/message-center/types/message-dispatch.types";
import { DEFAULT_PAGE_SIZE, parseListQuery } from "@/lib/shared/list-query";
import type {
  MessageChannel,
  MessageDispatchType,
  MessageSendStatus,
} from "@/types/database.types";

export function createDefaultMessageDispatchListQuery(): MessageDispatchListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    channel: "",
    dispatchType: "",
    status: "",
    quickPeriod: "",
    startDate: "",
    endDate: "",
    search: "",
  };
}

export function parseMessageDispatchListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): MessageDispatchListQuery {
  const base = parseListQuery(searchParams);

  return {
    page: base.page,
    pageSize: base.pageSize,
    channel: parseChannel(searchParams.channel),
    dispatchType: parseDispatchType(searchParams.dispatchType),
    status: parseStatus(searchParams.status),
    quickPeriod: parseQuickPeriod(searchParams.quickPeriod),
    startDate: parseStringParam(searchParams.startDate),
    endDate: parseStringParam(searchParams.endDate),
    search: parseStringParam(searchParams.search),
  };
}

export function buildMessageDispatchListQueryString(
  params: Partial<MessageDispatchListQuery>,
  base?: MessageDispatchListQuery,
): string {
  const merged: MessageDispatchListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    channel: params.channel ?? base?.channel ?? "",
    dispatchType: params.dispatchType ?? base?.dispatchType ?? "",
    status: params.status ?? base?.status ?? "",
    quickPeriod: params.quickPeriod ?? base?.quickPeriod ?? "",
    startDate: params.startDate ?? base?.startDate ?? "",
    endDate: params.endDate ?? base?.endDate ?? "",
    search: params.search ?? base?.search ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.channel) query.set("channel", merged.channel);
  if (merged.dispatchType) query.set("dispatchType", merged.dispatchType);
  if (merged.status) query.set("status", merged.status);
  if (merged.quickPeriod) query.set("quickPeriod", merged.quickPeriod);
  if (merged.startDate) query.set("startDate", merged.startDate);
  if (merged.endDate) query.set("endDate", merged.endDate);
  if (merged.search) query.set("search", merged.search);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildMessageDispatchPageHref(
  page: number,
  query: MessageDispatchListQuery,
) {
  return `/admin/others/message-center${buildMessageDispatchListQueryString({ page }, query)}`;
}

export function resolveQuickPeriodRange(quickPeriod: MessageQuickPeriod) {
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

export function getEffectiveDateRange(query: MessageDispatchListQuery) {
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

function parseChannel(value: string | string[] | undefined): MessageChannel | "" {
  const raw = parseStringParam(value);

  if (
    raw === "sms" ||
    raw === "lms" ||
    raw === "kakao_alimtalk" ||
    raw === "kakao_friendtalk" ||
    raw === "email"
  ) {
    return raw;
  }

  return "";
}

function parseDispatchType(
  value: string | string[] | undefined,
): MessageDispatchType | "" {
  const raw = parseStringParam(value);

  if (raw === "single" || raw === "bulk" || raw === "scheduled") {
    return raw;
  }

  return "";
}

function parseStatus(value: string | string[] | undefined): MessageSendStatus | "" {
  const raw = parseStringParam(value);

  if (
    raw === "draft" ||
    raw === "scheduled" ||
    raw === "pending" ||
    raw === "sent" ||
    raw === "failed" ||
    raw === "canceled"
  ) {
    return raw;
  }

  return "";
}

function parseQuickPeriod(value: string | string[] | undefined): MessageQuickPeriod {
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

export function getDispatchDateRange(query: MessageDispatchListQuery) {
  const { startDate, endDate } = getEffectiveDateRange(query);

  return {
    startAt: startDate ? toStartOfDayIso(startDate) : "",
    endAt: endDate ? toEndOfDayIso(endDate) : "",
  };
}
