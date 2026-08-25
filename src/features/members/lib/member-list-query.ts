import type {
  MemberLearningStatus,
  MemberListQuery,
} from "@/features/members/services/member-list.service";
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

  const rawLearning = Array.isArray(searchParams.learning)
    ? searchParams.learning[0]
    : searchParams.learning;

  return {
    ...base,
    status: isMemberStatus(rawStatus) ? rawStatus : "",
    source: rawSource === "office" || rawSource === "general" ? rawSource : "",
    learningStatus: isLearningStatus(rawLearning) ? rawLearning : "",
  };
}

export function buildMemberPageHref(page: number, query: MemberListQuery) {
  const base = buildListQueryString({ page }, query);
  const extras: string[] = [];
  if (query.status) extras.push(`status=${query.status}`);
  if (query.source) extras.push(`source=${query.source}`);
  if (query.learningStatus) extras.push(`learning=${query.learningStatus}`);

  if (extras.length === 0) {
    return `/admin/members${base}`;
  }

  const separator = base ? "&" : "?";
  return `/admin/members${base}${separator}${extras.join("&")}`;
}

function isMemberStatus(value: string | undefined): value is MemberStatus {
  return !!value && (MEMBER_STATUS_VALUES as string[]).includes(value);
}

const LEARNING_STATUS_VALUES: MemberLearningStatus[] = [
  "joined",
  "learning",
  "completed",
  "issued",
];

function isLearningStatus(
  value: string | undefined,
): value is MemberLearningStatus {
  return !!value && (LEARNING_STATUS_VALUES as string[]).includes(value);
}
