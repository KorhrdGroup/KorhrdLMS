"use server";

import { restoreMembers } from "@/features/members/services/member-restore.service";
import type { MemberRestoreResult } from "@/features/members/services/member-restore.service";

/** @see Phase 2-5에서 구현 예정 */
export async function restoreMembersAction(
  memberIds: string[],
): Promise<MemberRestoreResult> {
  return restoreMembers(memberIds);
}
