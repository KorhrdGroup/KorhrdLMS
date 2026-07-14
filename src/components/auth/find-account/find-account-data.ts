export type MockAccount = {
  name: string;
  phone: string;
  loginId: string;
  registeredAt: string;
};

/** 실제 API 연동 전, 데모/테스트를 위한 Mock 회원 데이터 */
export const MOCK_ACCOUNTS: MockAccount[] = [
  { name: "홍길동", phone: "010-1234-5678", loginId: "hanpyeong01", registeredAt: "2025-03-02" },
  { name: "김한평", phone: "010-9999-8888", loginId: "kimhp2024", registeredAt: "2024-07-19" },
  { name: "이수강", phone: "010-2222-3333", loginId: "study_lee", registeredAt: "2026-01-11" },
];

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

/** 아이디를 마스킹 처리합니다. (예: hanpyeong01 -> hanp*****1) */
export function maskLoginId(loginId: string) {
  if (loginId.length <= 4) return `${loginId[0]}${"*".repeat(loginId.length - 1)}`;
  const visibleStart = loginId.slice(0, Math.ceil(loginId.length / 2) - 1);
  const visibleEnd = loginId.slice(-1);
  const maskedLength = loginId.length - visibleStart.length - visibleEnd.length;
  return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}`;
}

export function findAccountByNameAndPhone(name: string, phone: string): MockAccount | null {
  const targetPhone = normalizePhone(phone);
  return (
    MOCK_ACCOUNTS.find(
      (account) => account.name === name.trim() && normalizePhone(account.phone) === targetPhone,
    ) ?? null
  );
}

export function verifyAccountForPassword(
  loginId: string,
  name: string,
  phone: string,
): MockAccount | null {
  const targetPhone = normalizePhone(phone);
  return (
    MOCK_ACCOUNTS.find(
      (account) =>
        account.loginId === loginId.trim() &&
        account.name === name.trim() &&
        normalizePhone(account.phone) === targetPhone,
    ) ?? null
  );
}

/** 회원 정보 기반으로 결정적인(=매번 동일한) Mock 임시 비밀번호를 생성합니다. */
export function generateMockTempPassword(loginId: string) {
  let hash = 0;
  for (const char of loginId) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1_000_000;
  }
  const digits = String(hash).padStart(6, "0").slice(0, 4);
  return `Hp!${digits}`;
}
