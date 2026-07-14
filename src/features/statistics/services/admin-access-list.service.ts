import { ADMIN_USER_LIST_SELECT } from "@/features/statistics/constants";
import {
  getAccessLogDateRange,
} from "@/features/statistics/lib/admin-access-list-query";
import type {
  AdminAccessListItem,
  AdminAccessListQuery,
} from "@/features/statistics/types/admin-access.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";
import type { AdminType } from "@/types/database.types";

type AdminUserRow = {
  id: string;
  admin_type: AdminType;
  login_id: string;
  name: string;
  created_at: string;
};

async function getAdminIdsInPeriod(query: AdminAccessListQuery) {
  const { startAt, endAt } = getAccessLogDateRange(query);

  if (!startAt && !endAt) {
    return null;
  }

  const supabase = await createClient();
  let builder = supabase.from("admin_access_logs").select("admin_user_id");

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

  return [...new Set((data ?? []).map((row) => row.admin_user_id))];
}

async function getAccessSummary(adminUserId: string, query: AdminAccessListQuery) {
  const supabase = await createClient();
  const { startAt, endAt } = getAccessLogDateRange(query);

  let builder = supabase
    .from("admin_access_logs")
    .select("logged_in_at", { count: "exact" })
    .eq("admin_user_id", adminUserId)
    .order("logged_in_at", { ascending: false })
    .limit(1);

  if (startAt) {
    builder = builder.gte("logged_in_at", startAt);
  }

  if (endAt) {
    builder = builder.lte("logged_in_at", endAt);
  }

  const { data, count, error } = await builder;

  if (error) {
    throw new Error(error.message);
  }

  return {
    lastAccessAt: data?.[0]?.logged_in_at ?? null,
    accessCount: count ?? 0,
  };
}

export async function getAdminAccessList(
  query: AdminAccessListQuery,
): Promise<PaginatedResult<AdminAccessListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);
  const periodAdminIds = await getAdminIdsInPeriod(query);

  if (periodAdminIds && periodAdminIds.length === 0) {
    return {
      data: [],
      total: 0,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: 0,
    };
  }

  let builder = supabase
    .from("admin_users")
    .select(ADMIN_USER_LIST_SELECT, { count: "exact" })
    .order("name", { ascending: true });

  if (query.adminType) {
    builder = builder.eq("admin_type", query.adminType);
  }

  if (query.adminName) {
    const keyword = `%${query.adminName}%`;
    builder = builder.or(`name.ilike.${keyword},login_id.ilike.${keyword}`);
  }

  if (periodAdminIds) {
    builder = builder.in("id", periodAdminIds);
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as AdminUserRow[];
  const items = await Promise.all(
    rows.map(async (row) => {
      const summary = await getAccessSummary(row.id, query);

      return {
        id: row.id,
        adminType: row.admin_type,
        loginId: row.login_id,
        name: row.name,
        lastAccessAt: summary.lastAccessAt,
        accessCount: summary.accessCount,
      };
    }),
  );

  const total = count ?? 0;

  return {
    data: items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}
