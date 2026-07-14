export const DEFAULT_PAGE_SIZE = 20;

export type ListSearchField = "all" | "name" | "login_id" | "email" | "phone";

export type ListQuery = {
  page: number;
  pageSize: number;
  search: string;
  field: ListSearchField;
  showDeleted?: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function parseListQuery(
  searchParams: Record<string, string | string[] | undefined>,
  defaults?: Partial<ListQuery>,
): ListQuery {
  const page = Math.max(
    1,
    Number(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) || 1,
  );
  const pageSize =
    Number(
      Array.isArray(searchParams.pageSize)
        ? searchParams.pageSize[0]
        : searchParams.pageSize,
    ) || defaults?.pageSize || DEFAULT_PAGE_SIZE;

  const search =
    (Array.isArray(searchParams.search)
      ? searchParams.search[0]
      : searchParams.search) ?? defaults?.search ?? "";

  const rawField = Array.isArray(searchParams.field)
    ? searchParams.field[0]
    : searchParams.field;

  const field = isListSearchField(rawField) ? rawField : defaults?.field ?? "all";

  const rawShowDeleted = Array.isArray(searchParams.showDeleted)
    ? searchParams.showDeleted[0]
    : searchParams.showDeleted;
  const showDeleted =
    rawShowDeleted === "1" ||
    rawShowDeleted === "true" ||
    defaults?.showDeleted === true;

  return {
    page,
    pageSize,
    search: search.trim(),
    field,
    showDeleted,
  };
}

export function buildListQueryString(
  params: Partial<ListQuery>,
  base?: ListQuery,
): string {
  const merged: ListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    field: params.field ?? base?.field ?? "all",
    showDeleted: params.showDeleted ?? base?.showDeleted ?? false,
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.field !== "all") query.set("field", merged.field);
  if (merged.showDeleted) query.set("showDeleted", "1");

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function getPaginationRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function getTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

function isListSearchField(value: string | undefined): value is ListSearchField {
  return (
    value === "all" ||
    value === "name" ||
    value === "login_id" ||
    value === "email" ||
    value === "phone"
  );
}
