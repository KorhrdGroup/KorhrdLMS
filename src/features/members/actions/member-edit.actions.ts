"use server";

import {
  getMemberForEdit,
  updateMember,
  updateMemberMemo,
} from "@/features/members/services/member-edit.service";
import type {
  GetMemberForEditResult,
  MemberEditInput,
  MemberEditResult,
} from "@/features/members/types/member-edit.types";

export async function getMemberForEditAction(
  memberId: string,
): Promise<GetMemberForEditResult> {
  return getMemberForEdit(memberId);
}

export async function updateMemberAction(
  memberId: string,
  input: MemberEditInput,
): Promise<MemberEditResult> {
  return updateMember(memberId, input);
}

export async function updateMemberMemoAction(
  memberId: string,
  memo: string,
): Promise<MemberEditResult> {
  return updateMemberMemo(memberId, memo);
}
