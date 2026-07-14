import {
  BOARD_COMMENT_SELECT,
  BOARD_DETAIL_SELECT,
  BOARD_REPLY_SELECT,
} from "@/features/boards/constants";
import type {
  BoardCommentItem,
  BoardPostDetail,
  BoardReplyItem,
  GetBoardPostDetailResult,
  GetBoardPostForEditResult,
} from "@/features/boards/types/board.types";
import { createClient } from "@/lib/supabase/server";
import type { BoardType } from "@/types/database.types";

type BoardDetailRow = {
  id: string;
  board_type: BoardType;
  parent_id: string | null;
  title: string;
  content: string;
  author_name: string;
  is_notice: boolean;
  attachment_file_name: string | null;
  attachment_file_url: string | null;
  created_at: string;
  updated_at: string;
};

type BoardReplyRow = {
  id: string;
  parent_id: string | null;
  title: string;
  content: string;
  author_name: string;
  attachment_file_name: string | null;
  attachment_file_url: string | null;
  created_at: string;
};

type BoardCommentRow = {
  id: string;
  post_id: string;
  content: string;
  author_name: string;
  created_at: string;
};

function mapReply(row: BoardReplyRow): BoardReplyItem {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    authorName: row.author_name,
    attachmentFileName: row.attachment_file_name,
    attachmentFileUrl: row.attachment_file_url,
    createdAt: row.created_at,
  };
}

function mapComment(row: BoardCommentRow): BoardCommentItem {
  return {
    id: row.id,
    content: row.content,
    authorName: row.author_name,
    createdAt: row.created_at,
  };
}

function mapDetail(
  row: BoardDetailRow,
  replies: BoardReplyItem[],
  comments: BoardCommentItem[],
): BoardPostDetail {
  return {
    id: row.id,
    boardType: row.board_type,
    title: row.title,
    content: row.content,
    authorName: row.author_name,
    isNotice: row.is_notice,
    attachmentFileName: row.attachment_file_name,
    attachmentFileUrl: row.attachment_file_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    replies,
    comments,
  };
}

export async function getBoardPostDetail(
  postId: string,
): Promise<GetBoardPostDetailResult> {
  if (!postId.trim()) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("board_posts")
    .select(BOARD_DETAIL_SELECT)
    .eq("id", postId)
    .is("parent_id", null)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  const row = data as BoardDetailRow;

  const [repliesResult, commentsResult] = await Promise.all([
    supabase
      .from("board_posts")
      .select(BOARD_REPLY_SELECT)
      .eq("parent_id", postId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("board_comments")
      .select(BOARD_COMMENT_SELECT)
      .eq("post_id", postId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
  ]);

  if (repliesResult.error) {
    throw new Error(repliesResult.error.message);
  }

  if (commentsResult.error) {
    throw new Error(commentsResult.error.message);
  }

  return {
    success: true,
    post: mapDetail(
      row,
      ((repliesResult.data ?? []) as BoardReplyRow[]).map(mapReply),
      ((commentsResult.data ?? []) as BoardCommentRow[]).map(mapComment),
    ),
  };
}

export async function getBoardPostForEdit(
  postId: string,
): Promise<GetBoardPostForEditResult> {
  if (!postId.trim()) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("board_posts")
    .select(BOARD_DETAIL_SELECT)
    .eq("id", postId)
    .is("parent_id", null)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  const row = data as BoardDetailRow;

  return {
    success: true,
    post: {
      id: row.id,
      boardType: row.board_type,
      title: row.title,
      content: row.content,
      authorName: row.author_name,
      isNotice: row.is_notice,
      attachmentFileName: row.attachment_file_name ?? "",
      attachmentFileUrl: row.attachment_file_url ?? "",
    },
  };
}
