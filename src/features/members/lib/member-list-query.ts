import type { MemberListQuery } from "@/features/members/services/member-list.service";
import { buildListQueryString, parseListQuery } from "@/lib/shared/list-query";
import type { MemberStatus } from "@/types/database.types";

const MEMBER_STATUS_VALUES: MemberStatus[] = [
  "active",
  "inactive",
  "dormant",
  "withdrawn",
  "pending",
];

export function parseMemberListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): MemberListQuery {
  const base = parseListQuery(searchParams);
  const rawStatus = Array.isArray(searchParams.status)
    ? searchParams.status[0]
    : searchParams.status;

  return {
    ...base,
    status: isMemberStatus(rawStatus) ? rawStatus : "",
  };
}

export function buildMemberPageHref(page: number, query: MemberListQuery) {
  const base = buildListQueryString({ page }, query);

  if (!query.status) {
    return `/admin/members${base}`;
  }

  const separator = base ? "&" : "?";
  return `/admin/members${base}${separator}status=${query.status}`;
}

function isMemberStatus(value: string | undefined): value is MemberStatus {
  return !!value && (MEMBER_STATUS_VALUES as string[]).includes(value);
}
