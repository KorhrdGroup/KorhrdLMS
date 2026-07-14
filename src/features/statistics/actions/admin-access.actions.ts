"use server";

import { getAdminAccessLogs } from "@/features/statistics/services/admin-access-detail.service";
import type {
  AdminAccessListQuery,
  GetAdminAccessLogsResult,
} from "@/features/statistics/types/admin-access.types";

export async function getAdminAccessLogsAction(
  adminUserId: string,
  query: AdminAccessListQuery,
): Promise<GetAdminAccessLogsResult> {
  return getAdminAccessLogs(adminUserId, query);
}
