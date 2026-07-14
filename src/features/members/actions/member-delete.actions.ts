"use server";

import { softDeleteMembers } from "@/features/members/services/member-delete.service";
import type { MemberDeleteResult } from "@/features/members/services/member-delete.service";

export async function softDeleteMembersAction(
  memberIds: string[],
): Promise<MemberDeleteResult> {
  return softDeleteMembers(memberIds);
}
