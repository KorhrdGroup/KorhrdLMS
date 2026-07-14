import type { MemberStatus } from "@/types/database.types";

export const MEMBER_EDIT_SELECT =
  "id, login_id, name, email, phone, status, manager_name, postal_code, address, address_detail, birth_date, memo" as const;

export type MemberEditInput = {
  name: string;
  phone: string;
  email: string;
  status: MemberStatus;
  managerName: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  birthDate: string;
  memo: string;
};

export type MemberEditDetail = MemberEditInput & {
  id: string;
  loginId: string;
};

export type MemberEditResult =
  | { success: true }
  | { success: false; message: string; field?: keyof MemberEditInput };

export type GetMemberForEditResult =
  | { success: true; member: MemberEditDetail }
  | { success: false; message: string };
