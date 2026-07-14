import { formatDate } from "@/lib/shared/format-date";

export function formatMemberNameWithId(name: string, loginId: string) {
  return `${name}(${loginId})`;
}

export function formatPaymentAmount(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function formatCouponApplied(applied: boolean) {
  return applied ? "적용" : "미적용";
}

export function formatOptionalText(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function formatClassPeriod(start: string | null, end: string | null) {
  if (start && end) {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  }

  if (start) {
    return formatDate(start);
  }

  if (end) {
    return formatDate(end);
  }

  return "—";
}
