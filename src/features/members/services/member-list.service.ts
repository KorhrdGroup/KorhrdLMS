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
export type MemberListQuery = ListQuery & {
  status?: MemberStatus | "";
  /** 가입 출처 분리 — office: 오피스(학점연계 자동발급) / general: 그 외 (2026-08-20) */
  source?: "" | "office" | "general";
  /**
   * 학습 상태 필터 (2026-08-25) — members_with_learning_status 뷰의 계산 컬럼.
   * joined: 가입만 / learning: 수강중 / completed: 과정수료(발급 전) / issued: 자격증발급
   */
  learningStatus?: "" | MemberLearningStatus;
};

export type MemberLearningStatus = "joined" | "learning" | "completed" | "issued";

/** 오피스 자동발급 가입의 join_path 표기 — auto-issue.service 와 짝 */
const OFFICE_JOIN_PATH = "학점연계 자동발급";

export async function getMemberList(
  query: MemberListQuery,
): Promise<PaginatedResult<MemberListRow>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  // 학습 상태 필터가 있으면 계산 컬럼(learning_status)이 붙은 뷰에서 조회합니다.
  // 뷰는 members의 모든 컬럼을 그대로 노출하므로 나머지 조건은 동일하게 동작합니다.
  const table = query.learningStatus
    ? ("members_with_learning_status" as "members")
    : "members";

  let builder = supabase
    .from(table)
    .select(MEMBER_LIST_SELECT, { count: "exact" })
    .order("joined_at", { ascending: false });

  if (query.learningStatus) {
    builder = builder.eq(
      "learning_status" as never,
      query.learningStatus as never,
    );
  }

  if (!query.showDeleted) {
    builder = builder.is("deleted_at", null);
  }

  if (query.status) {
    builder = builder.eq("status", query.status);
  }

  if (query.source === "office") {
    builder = builder.eq("join_path", OFFICE_JOIN_PATH);
  } else if (query.source === "general") {
    builder = builder.or(`join_path.is.null,join_path.neq.${OFFICE_JOIN_PATH}`);
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
