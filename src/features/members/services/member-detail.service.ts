import {
  MEMBER_DETAIL_SELECT,
  type GetMemberDetailResult,
  type MemberDetail,
} from "@/features/members/types/member-detail.types";
import { createClient } from "@/lib/supabase/server";
import type { MemberStatus } from "@/types/database.types";

function mapRowToDetail(row: {
  id: string;
  login_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: MemberStatus;
  manager_name: string | null;
  joined_at: string;
  deleted_at: string | null;
}): MemberDetail {
  return {
    id: row.id,
    loginId: row.login_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    managerName: row.manager_name,
    joinedAt: row.joined_at,
    deletedAt: row.deleted_at,
  };
}

export async function getMemberDetail(
  memberId: string,
): Promise<GetMemberDetailResult> {
  if (!memberId.trim()) {
    return { success: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_DETAIL_SELECT)
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  return { success: true, member: mapRowToDetail(data) };
}
