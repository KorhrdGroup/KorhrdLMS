import { ADMIN_ACCESS_LOG_SELECT } from "@/features/statistics/constants";
import { getAccessLogDateRange } from "@/features/statistics/lib/admin-access-list-query";
import type {
  AdminAccessListQuery,
  AdminAccessLogItem,
  GetAdminAccessLogsResult,
} from "@/features/statistics/types/admin-access.types";
import { createClient } from "@/lib/supabase/server";
import type { AdminType } from "@/types/database.types";

type AdminAccessLogRow = {
  id: string;
  admin_user_id: string;
  access_ip: string;
  logged_in_at: string;
  logged_out_at: string | null;
  admin_user: {
    id: string;
    admin_type: AdminType;
    login_id: string;
    name: string;
  };
};

function mapAdminAccessLogItem(row: AdminAccessLogRow): AdminAccessLogItem {
  return {
    id: row.id,
    adminType: row.admin_user.admin_type,
    adminName: row.admin_user.name,
    adminLoginId: row.admin_user.login_id,
    accessIp: row.access_ip,
    loggedInAt: row.logged_in_at,
    loggedOutAt: row.logged_out_at,
  };
}

export async function getAdminAccessLogs(
  adminUserId: string,
  query: AdminAccessListQuery,
): Promise<GetAdminAccessLogsResult> {
  if (!adminUserId.trim()) {
    return { success: false, message: "관리자 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { startAt, endAt } = getAccessLogDateRange(query);

  let builder = supabase
    .from("admin_access_logs")
    .select(ADMIN_ACCESS_LOG_SELECT)
    .eq("admin_user_id", adminUserId)
    .order("logged_in_at", { ascending: false });

  if (startAt) {
    builder = builder.gte("logged_in_at", startAt);
  }

  if (endAt) {
    builder = builder.lte("logged_in_at", endAt);
  }

  const { data, error } = await builder;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as AdminAccessLogRow[];

  return {
    success: true,
    logs: rows.map(mapAdminAccessLogItem),
  };
}
