/**
 * 한국 시간(KST, UTC+9) 기준 날짜.
 *
 * 서버가 어느 나라에서 돌든 "오늘"은 한국 날짜여야 합니다.
 * `new Date().toISOString().slice(0, 10)` 은 **UTC 날짜**라, 한국 시간으로
 * 00:00~09:00 사이에는 전날이 나옵니다. 수강기간·시험 응시 가능 여부·신청일이
 * 하루씩 어긋나는 원인이 됩니다.
 *
 * Intl 로 계산해 서머타임·서버 로캘에 영향받지 않게 합니다.
 */
const KST_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 한국 기준 오늘 날짜 "YYYY-MM-DD" */
export function todayInKst(): string {
  // en-CA 로캘은 YYYY-MM-DD 형식을 내줍니다.
  return KST_FORMATTER.format(new Date());
}

/** 주어진 시각을 한국 기준 날짜 "YYYY-MM-DD" 로 */
export function toKstDate(value: Date | string): string {
  return KST_FORMATTER.format(typeof value === "string" ? new Date(value) : value);
}

/** 한국 기준 날짜에 일수를 더합니다. "2026-08-06" + 7 → "2026-08-13" */
export function addDaysKst(date: string, days: number): string {
  const base = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}
