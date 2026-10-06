/**
 * 휴대폰·전화번호를 하이픈 형식으로 — "01012341234" → "010-1234-1234", "0212345678" → "02-1234-5678".
 * DB 의 format_kr_phone(20261006100000 마이그레이션)과 같은 규칙. 형식을 알 수 없는 값은 그대로 둔다.
 */
export function formatKrPhone(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return raw ?? "";
  const d = raw.replace(/\D/g, "");
  if (!d.startsWith("0")) return raw;
  if (d.startsWith("02")) {
    if (d.length === 10) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
    if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return raw;
  }
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return raw;
}
