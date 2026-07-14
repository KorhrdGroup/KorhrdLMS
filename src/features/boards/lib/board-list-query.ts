import type { BoardListQuery } from "@/features/boards/types/board.types";
import { DEFAULT_PAGE_SIZE, parseListQuery } from "@/lib/shared/list-query";
import type { BoardType } from "@/types/database.types";

const BOARD_TYPES: BoardType[] = [
  "consultation",
  "notice",
  "free",
  "resource",
  "faq",
];

export function isBoardType(value: string): value is BoardType {
  return BOARD_TYPES.includes(value as BoardType);
}

export function createDefaultBoardListQuery(): BoardListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    search: "",
  };
}

export function parseBoardListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): BoardListQuery {
  const base = parseListQuery(searchParams);

  return {
    page: base.page,
    pageSize: base.pageSize,
    search: base.search,
  };
}

export function buildBoardListQueryString(
  boardType: BoardType,
  params: Partial<BoardListQuery>,
  base?: BoardListQuery,
): string {
  const merged: BoardListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildBoardPageHref(
  boardType: BoardType,
  page: number,
  query: BoardListQuery,
) {
  return `/admin/boards/${boardType}${buildBoardListQueryString(boardType, { page }, query)}`;
}
