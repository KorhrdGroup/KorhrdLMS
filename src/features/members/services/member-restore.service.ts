import type { MemberListItem } from "@/types/database.types";

export type MemberRestoreResult =
  | { success: true; restoredCount: number }
  | { success: false; message: string };

/**
 * Soft-deleted 회원 복구 (deleted_at → null)
 * @see Phase 2-5에서 구현 예정
 */
export async function restoreMembers(
  _memberIds: string[],
): Promise<MemberRestoreResult> {
  return {
    success: false,
    message: "복구 기능은 다음 단계에서 구현 예정입니다.",
  };
}

export function getRestorableMemberIds(
  memberIds: string[],
  members: MemberListItem[],
) {
  const memberMap = new Map(members.map((member) => [member.id, member]));

  return memberIds.filter((id) => {
    const member = memberMap.get(id);
    return member?.deleted_at != null;
  });
}

export function getDeletableMemberIds(
  memberIds: string[],
  members: MemberListItem[],
) {
  const memberMap = new Map(members.map((member) => [member.id, member]));

  return memberIds.filter((id) => {
    const member = memberMap.get(id);
    if (!member) {
      return true;
    }

    return member.deleted_at == null;
  });
}
