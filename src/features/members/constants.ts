import type { Member, MemberStatus } from "@/types/database.types";

export type { Member, MemberStatus };

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: "활성",
  inactive: "비활성",
  dormant: "휴면",
  withdrawn: "탈퇴",
  pending: "대기",
};

export const MEMBER_SEARCH_FIELD_LABELS = {
  all: "전체",
  name: "이름",
  login_id: "아이디",
  email: "이메일",
  phone: "연락처",
} as const;

export const MEMBER_LIST_SELECT =
  "id, login_id, name, email, phone, status, manager_name, joined_at, last_login_at, deleted_at, memo" as const;

export function isMemberDeleted(member: { deleted_at: string | null }) {
  return member.deleted_at !== null;
}

export type MemberSearchField = keyof typeof MEMBER_SEARCH_FIELD_LABELS;

export const CALENDAR_TYPE_LABELS = {
  solar: "양력",
  lunar: "음력",
} as const;
