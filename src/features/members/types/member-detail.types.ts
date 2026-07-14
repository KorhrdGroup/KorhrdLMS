import type { MemberStatus } from "@/types/database.types";

export const MEMBER_DETAIL_SELECT =
  "id, login_id, name, email, phone, status, manager_name, joined_at, deleted_at" as const;

export type MemberDetail = {
  id: string;
  loginId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: MemberStatus;
  managerName: string | null;
  joinedAt: string;
  deletedAt: string | null;
};

export type GetMemberDetailResult =
  | { success: true; member: MemberDetail }
  | { success: false; message: string };
