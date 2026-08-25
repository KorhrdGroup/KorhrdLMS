"use server";

import { cookies } from "next/headers";

import { ADMIN_SESSION_MARKER_COOKIE } from "@/features/admin-auth/constants";
import {
  bulkSendMemberAlimtalk,
  countMemberAlimtalkTargets,
  type AlimtalkTargetMode,
  type BulkAlimtalkResult,
} from "@/features/members/services/member-alimtalk.service";
import type { AlimtalkTemplateKey } from "@/lib/aligo/alimtalk";

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(ADMIN_SESSION_MARKER_COOKIE));
}

export async function countMemberAlimtalkTargetsAction(input: {
  mode: AlimtalkTargetMode;
  memberIds: string[];
  source: "" | "office" | "general";
}): Promise<{ success: boolean; count: number; message?: string }> {
  if (!(await requireAdmin())) {
    return { success: false, count: 0, message: "관리자만 사용할 수 있습니다." };
  }
  const count = await countMemberAlimtalkTargets(input);
  return { success: true, count };
}

export async function bulkSendMemberAlimtalkAction(input: {
  template: AlimtalkTemplateKey;
  mode: AlimtalkTargetMode;
  memberIds: string[];
  source: "" | "office" | "general";
}): Promise<BulkAlimtalkResult> {
  if (!(await requireAdmin())) {
    return { success: false, message: "관리자만 사용할 수 있습니다.", sent: 0, failed: 0, skipped: 0 };
  }
  return bulkSendMemberAlimtalk(input);
}
