"use server";

import {
  createBoardComment,
  createBoardPost,
  createBoardReply,
  deleteBoardPost,
  updateBoardPost,
} from "@/features/boards/services/board-mutation.service";
import {
  getBoardPostDetail,
  getBoardPostForEdit,
} from "@/features/boards/services/board-detail.service";
import type {
  BoardCommentInput,
  BoardCommentMutationResult,
  BoardDeleteResult,
  BoardMutationResult,
  BoardPostInput,
  BoardReplyInput,
  BoardReplyMutationResult,
} from "@/features/boards/types/board-form.types";
import type {
  GetBoardPostDetailResult,
  GetBoardPostForEditResult,
} from "@/features/boards/types/board.types";
import type { BoardType } from "@/types/database.types";

export async function getBoardPostDetailAction(
  postId: string,
): Promise<GetBoardPostDetailResult> {
  return getBoardPostDetail(postId);
}

export async function getBoardPostForEditAction(
  postId: string,
): Promise<GetBoardPostForEditResult> {
  return getBoardPostForEdit(postId);
}

export async function createBoardPostAction(
  boardType: BoardType,
  input: BoardPostInput,
): Promise<BoardMutationResult> {
  return createBoardPost(boardType, input);
}

export async function updateBoardPostAction(
  postId: string,
  input: BoardPostInput,
): Promise<BoardMutationResult> {
  return updateBoardPost(postId, input);
}

export async function deleteBoardPostAction(postId: string): Promise<BoardDeleteResult> {
  return deleteBoardPost(postId);
}

export async function createBoardReplyAction(
  postId: string,
  input: BoardReplyInput,
): Promise<BoardReplyMutationResult> {
  return createBoardReply(postId, input);
}

export async function createBoardCommentAction(
  postId: string,
  input: BoardCommentInput,
): Promise<BoardCommentMutationResult> {
  return createBoardComment(postId, input);
}
