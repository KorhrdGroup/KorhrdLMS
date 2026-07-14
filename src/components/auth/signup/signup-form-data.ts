export const SIGNUP_JOIN_PATHS = [
  "대학교",
  "평생교육원",
  "문화센터",
  "뉴스검색",
  "블로그",
  "페이스북",
  "카카오톡",
  "네이버검색",
  "다음검색",
  "공공기관공지",
  "주변인소개",
  "인스타그램",
  "프리패스 쿠폰",
] as const;

export const SIGNUP_EMAIL_DOMAINS = [
  { label: "선택하세요", value: "" },
  { label: "naver.com", value: "naver.com" },
  { label: "gmail.com", value: "gmail.com" },
  { label: "hanmail.net", value: "hanmail.net" },
  { label: "daum.net", value: "daum.net" },
  { label: "nate.com", value: "nate.com" },
  { label: "직접입력", value: "custom" },
] as const;

export const SIGNUP_PHONE_PREFIXES = ["010", "011", "016", "017", "018", "019"] as const;

export const SIGNUP_BIRTH_YEARS = Array.from({ length: 80 }, (_, index) => String(2025 - index));

export const SIGNUP_BIRTH_MONTHS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export const SIGNUP_BIRTH_DAYS = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);
