/**
 * 발급신청 "추가" 담당자 알림 — 오피스(korhrd-group-db)에 묻고 알립니다 (2026-11-23).
 * 교육지원팀 「무료 발급이 필요한 학생을 추가한 뒤 담당자에게 직접 전달해야 함」 → 추가 창에서 고른
 * 오피스 직원에게 오피스 알림 + 팝업 「○○님 발급신청이 추가되었습니다」.
 *
 * 매출 웹훅(office-cert-sales.ts)과 같은 OFFICE_API_URL · CERT_SALES_WEBHOOK_SECRET 을 씁니다.
 * 둘 중 하나라도 없으면 담당자 목록은 빈 목록, 알림은 보내지 않습니다(발급신청 저장은 그대로).
 */

function officeConfig() {
  const baseUrl = process.env.OFFICE_API_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.CERT_SALES_WEBHOOK_SECRET?.trim();
  return baseUrl && secret ? { baseUrl, secret } : null;
}

/** 응답 본문까지 8초 안에 — 오피스가 연결만 열고 멈춰도 저장 버튼이 오래 묶이지 않게 (Opus 5.5 리뷰) */
async function officeFetch(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const config = officeConfig();
  if (!config) throw new Error("오피스 연결 설정이 없습니다.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", "x-webhook-secret": config.secret, ...(init.headers ?? {}) },
      cache: "no-store",
      signal: controller.signal,
    });
    const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: response.ok, status: response.status, json };
  } finally {
    clearTimeout(timeout);
  }
}

/** 오피스 재직 직원 이름 — 추가 창 담당자 고르기 */
export async function getOfficeStaff(): Promise<{ staff: string[]; error: string | null }> {
  if (!officeConfig()) return { staff: [], error: "오피스 연결 설정이 없어 담당자를 고를 수 없습니다." };
  try {
    const response = await officeFetch("/api/hanjikhun/office-staff");
    if (!response.ok) return { staff: [], error: `오피스 직원 목록을 받지 못했습니다 (${response.status}).` };
    const staff = Array.isArray(response.json.staff) ? response.json.staff.map(String).filter(Boolean) : [];
    return { staff, error: null };
  } catch {
    return { staff: [], error: "오피스 직원 목록을 받지 못했습니다." };
  }
}

/** 담당자에게 오피스 알림 — 실패해도 던지지 않고 이유를 돌려줍니다(발급신청 저장은 이미 끝났습니다) */
export async function notifyOfficeApplicationAdded(input: {
  managerName: string;
  applicantName: string;
  certificateName: string;
  paymentStatus: "paid" | "unpaid";
}): Promise<{ ok: boolean; error: string | null }> {
  if (!officeConfig()) return { ok: false, error: "오피스 연결 설정이 없습니다." };
  try {
    const response = await officeFetch("/api/hanjikhun/application-added", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (response.ok) return { ok: true, error: null };
    return { ok: false, error: typeof response.json.error === "string" ? response.json.error : `오피스 응답 ${response.status}` };
  } catch {
    return { ok: false, error: "오피스에 알리지 못했습니다." };
  }
}
