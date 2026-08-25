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

  const rawSource = Array.isArray(searchParams.source)
    ? searchParams.source[0]
    : searchParams.source;

  return {
    ...base,
    status: isMemberStatus(rawStatus) ? rawStatus : "",
    source: rawSource === "office" || rawSource === "general" ? rawSource : "",
  };
}

export function buildMemberPageHref(page: number, query: MemberListQuery) {
  const base = buildListQueryString({ page }, query);
  const extras: string[] = [];
  if (query.status) extras.push(`status=${query.status}`);
  if (query.source) extras.push(`source=${query.source}`);

  if (extras.length === 0) {
    return `/admin/members${base}`;
  }

  const separator = base ? "&" : "?";
  return `/admin/members${base}${separator}${extras.join("&")}`;
}

function isMemberStatus(value: string | undefined): value is MemberStatus {
  return !!value && (MEMBER_STATUS_VALUES as string[]).includes(value);
}
