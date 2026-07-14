import { BOARD_LIST_SELECT } from "@/features/boards/constants";
import type { BoardListItem, BoardListQuery } from "@/features/boards/types/board.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";
import type { BoardType } from "@/types/database.types";

type BoardListRow = {
  id: string;
  board_type: BoardType;
  title: string;
  author_name: string;
  is_notice: boolean;
  attachment_file_name: string | null;
  created_at: string;
};

async function getReplyCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
) {
  const { count, error } = await supabase
    .from("board_posts")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", postId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function getCommentCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
) {
  const { count, error } = await supabase
    .from("board_comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getBoardList(
  boardType: BoardType,
  query: BoardListQuery,
): Promise<PaginatedResult<BoardListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("board_posts")
    .select(BOARD_LIST_SELECT, { count: "exact" })
    .eq("board_type", boardType)
    .is("parent_id", null)
    .is("deleted_at", null)
    .order("is_notice", { ascending: false })
    .order("created_at", { ascending: false });

  if (query.search) {
    const keyword = `%${query.search}%`;
    builder = builder.or(
      `title.ilike.${keyword},content.ilike.${keyword},author_name.ilike.${keyword}`,
    );
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as BoardListRow[];
  const items = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      boardType: row.board_type,
      title: row.title,
      authorName: row.author_name,
      isNotice: row.is_notice,
      attachmentFileName: row.attachment_file_name,
      replyCount: await getReplyCount(supabase, row.id),
      commentCount: await getCommentCount(supabase, row.id),
      createdAt: row.created_at,
    })),
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
