import type { ListQuery, PaginatedResult } from "@/lib/shared/list-query";
import {
  getPaginationRange,
  getTotalPages,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";
import { MEMBER_LIST_SELECT } from "@/features/members/constants";
import { getMemberCourseSummaries } from "@/features/members/services/member-course-summary.service";
import type { MemberListRow } from "@/features/members/types/member-list.types";
import type { MemberListItem, MemberStatus } from "@/types/database.types";

/**
 * `status`는 상단 메뉴의 "휴면회원"/"탈퇴회원" 바로가기(예: `?status=dormant`)를
 * 위한 선택적 필터입니다. 지정하지 않으면 기존과 동일하게 전체 상태를 조회합니다.
 */
export type MemberListQuery = ListQuery & { status?: MemberStatus | "" };

export async function getMemberList(
  query: MemberListQuery,
): Promise<PaginatedResult<MemberListRow>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("members")
    .select(MEMBER_LIST_SELECT, { count: "exact" })
    .order("joined_at", { ascending: false });

  if (!query.showDeleted) {
    builder = builder.is("deleted_at", null);
  }

  if (query.status) {
    builder = builder.eq("status", query.status);
  }

  if (query.search) {
    const keyword = `%${query.search}%`;

    switch (query.field) {
      case "name":
        builder = builder.ilike("name", keyword);
        break;
      case "login_id":
        builder = builder.ilike("login_id", keyword);
        break;
      case "email":
        builder = builder.ilike("email", keyword);
        break;
      case "phone":
        builder = builder.ilike("phone", keyword);
        break;
      default:
        builder = builder.or(
          `name.ilike.${keyword},login_id.ilike.${keyword},email.ilike.${keyword},phone.ilike.${keyword}`,
        );
        break;
    }
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;
  const members = (data ?? []) as MemberListItem[];
  const courseSummaries = await getMemberCourseSummaries(
    members.map((member) => member.id),
  );

  const rows: MemberListRow[] = members.map((member) => ({
    ...member,
    courses: courseSummaries.get(member.id) ?? [],
  }));

  return {
    data: rows,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}
