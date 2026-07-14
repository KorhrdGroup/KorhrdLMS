import type {
  BoardCommentInput,
  BoardCommentMutationResult,
  BoardDeleteResult,
  BoardMutationResult,
  BoardPostInput,
  BoardReplyInput,
  BoardReplyMutationResult,
} from "@/features/boards/types/board-form.types";
import { createClient } from "@/lib/supabase/server";
import type { BoardType, Database } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateBoardPostInput(input: BoardPostInput): BoardMutationResult {
  if (!normalize(input.title)) {
    return { success: false, message: "제목을 입력해주세요.", field: "title" };
  }

  if (!normalize(input.content)) {
    return { success: false, message: "내용을 입력해주세요.", field: "content" };
  }

  if (!normalize(input.authorName)) {
    return {
      success: false,
      message: "작성자를 입력해주세요.",
      field: "authorName",
    };
  }

  return { success: true, message: "" };
}

export function validateBoardReplyInput(input: BoardReplyInput): BoardReplyMutationResult {
  if (!normalize(input.content)) {
    return { success: false, message: "답글 내용을 입력해주세요.", field: "content" };
  }

  if (!normalize(input.authorName)) {
    return {
      success: false,
      message: "작성자를 입력해주세요.",
      field: "authorName",
    };
  }

  return { success: true, message: "" };
}

export function validateBoardCommentInput(
  input: BoardCommentInput,
): BoardCommentMutationResult {
  if (!normalize(input.content)) {
    return { success: false, message: "댓글 내용을 입력해주세요.", field: "content" };
  }

  if (!normalize(input.authorName)) {
    return {
      success: false,
      message: "작성자를 입력해주세요.",
      field: "authorName",
    };
  }

  return { success: true, message: "" };
}

async function ensureRootPostExists(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_posts")
    .select("id, board_type, title")
    .eq("id", postId)
    .is("parent_id", null)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as { id: string; board_type: BoardType; title: string } | null;
}

export async function createBoardPost(
  boardType: BoardType,
  input: BoardPostInput,
): Promise<BoardMutationResult> {
  const validation = validateBoardPostInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["board_posts"]["Insert"] = {
    board_type: boardType,
    title: normalize(input.title),
    content: normalize(input.content),
    author_name: normalize(input.authorName),
    is_notice: input.isNotice,
    attachment_file_name: emptyToNull(input.attachmentFileName),
    attachment_file_url: emptyToNull(input.attachmentFileUrl),
  };

  const { data, error } = await supabase
    .from("board_posts")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: "게시글이 등록되었습니다.",
    postId: data.id,
  };
}

export async function updateBoardPost(
  postId: string,
  input: BoardPostInput,
): Promise<BoardMutationResult> {
  const validation = validateBoardPostInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_posts")
    .update({
      title: normalize(input.title),
      content: normalize(input.content),
      author_name: normalize(input.authorName),
      is_notice: input.isNotice,
      attachment_file_name: emptyToNull(input.attachmentFileName),
      attachment_file_url: emptyToNull(input.attachmentFileUrl),
    })
    .eq("id", postId)
    .is("parent_id", null)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  return { success: true, message: "게시글이 수정되었습니다.", postId: data.id };
}

export async function deleteBoardPost(postId: string): Promise<BoardDeleteResult> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("board_posts")
    .update({ deleted_at: now })
    .eq("id", postId)
    .is("parent_id", null)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  await Promise.all([
    supabase
      .from("board_posts")
      .update({ deleted_at: now })
      .eq("parent_id", postId)
      .is("deleted_at", null),
    supabase
      .from("board_comments")
      .update({ deleted_at: now })
      .eq("post_id", postId)
      .is("deleted_at", null),
  ]);

  return { success: true, message: "게시글이 삭제되었습니다." };
}

export async function createBoardReply(
  postId: string,
  input: BoardReplyInput,
): Promise<BoardReplyMutationResult> {
  const validation = validateBoardReplyInput(input);
  if (!validation.success) {
    return validation;
  }

  const parent = await ensureRootPostExists(postId);
  if (!parent) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["board_posts"]["Insert"] = {
    board_type: parent.board_type,
    parent_id: postId,
    title: `Re: ${parent.title}`,
    content: normalize(input.content),
    author_name: normalize(input.authorName),
    is_notice: false,
    attachment_file_name: emptyToNull(input.attachmentFileName),
    attachment_file_url: emptyToNull(input.attachmentFileUrl),
  };

  const { error } = await supabase.from("board_posts").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "답글이 등록되었습니다." };
}

export async function createBoardComment(
  postId: string,
  input: BoardCommentInput,
): Promise<BoardCommentMutationResult> {
  const validation = validateBoardCommentInput(input);
  if (!validation.success) {
    return validation;
  }

  const parent = await ensureRootPostExists(postId);
  if (!parent) {
    return { success: false, message: "게시글을 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["board_comments"]["Insert"] = {
    post_id: postId,
    content: normalize(input.content),
    author_name: normalize(input.authorName),
  };

  const { error } = await supabase.from("board_comments").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "댓글이 등록되었습니다." };
}
