import { GRADE_SEARCH_FIELD_LABELS, type GradeSearchField } from "@/features/grades/constants";
import type { GradeListQuery } from "@/features/grades/services/grade-list.service";
import type { GradeFilterOption, PassFilterOption } from "@/features/grades/types/grade.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/list-query";

const GRADE_FILTER_VALUES: GradeFilterOption[] = ["all", "A", "B", "C", "D", "F"];
const PASS_FILTER_VALUES: PassFilterOption[] = ["all", "passed", "failed"];

export function parseGradeListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): GradeListQuery {
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const rawPageSize = Array.isArray(searchParams.pageSize)
    ? searchParams.pageSize[0]
    : searchParams.pageSize;
  const rawSearch = Array.isArray(searchParams.search)
    ? searchParams.search[0]
    : searchParams.search;
  const rawField = Array.isArray(searchParams.field) ? searchParams.field[0] : searchParams.field;
  const rawGrade = Array.isArray(searchParams.grade) ? searchParams.grade[0] : searchParams.grade;
  const rawPass = Array.isArray(searchParams.pass) ? searchParams.pass[0] : searchParams.pass;

  return {
    page: Math.max(1, Number(rawPage) || 1),
    pageSize: Number(rawPageSize) || DEFAULT_PAGE_SIZE,
    search: (rawSearch ?? "").trim(),
    field: isGradeSearchField(rawField) ? rawField : "all",
    grade: isGradeFilter(rawGrade) ? rawGrade : "all",
    pass: isPassFilter(rawPass) ? rawPass : "all",
  };
}

export function buildGradeListQueryString(
  params: Partial<GradeListQuery>,
  base?: GradeListQuery,
): string {
  const merged: GradeListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    field: params.field ?? base?.field ?? "all",
    grade: params.grade ?? base?.grade ?? "all",
    pass: params.pass ?? base?.pass ?? "all",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) query.set("pageSize", String(merged.pageSize));
  if (merged.search) query.set("search", merged.search);
  if (merged.field !== "all") query.set("field", merged.field);
  if (merged.grade !== "all") query.set("grade", merged.grade);
  if (merged.pass !== "all") query.set("pass", merged.pass);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildGradePageHref(page: number, query: GradeListQuery) {
  return `/admin/grades${buildGradeListQueryString({ page }, query)}`;
}

function isGradeSearchField(value: string | undefined): value is GradeSearchField {
  return !!value && Object.prototype.hasOwnProperty.call(GRADE_SEARCH_FIELD_LABELS, value);
}

function isGradeFilter(value: string | undefined): value is GradeFilterOption {
  return !!value && (GRADE_FILTER_VALUES as string[]).includes(value);
}

function isPassFilter(value: string | undefined): value is PassFilterOption {
  return !!value && (PASS_FILTER_VALUES as string[]).includes(value);
}
