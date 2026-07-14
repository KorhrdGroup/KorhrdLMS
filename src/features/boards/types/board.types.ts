import type { BoardType } from "@/types/database.types";

export type BoardListQuery = {
  page: number;
  pageSize: number;
  search: string;
};

export type BoardListItem = {
  id: string;
  boardType: BoardType;
  title: string;
  authorName: string;
  isNotice: boolean;
  attachmentFileName: string | null;
  replyCount: number;
  commentCount: number;
  createdAt: string;
};

export type BoardPostDetail = {
  id: string;
  boardType: BoardType;
  title: string;
  content: string;
  authorName: string;
  isNotice: boolean;
  attachmentFileName: string | null;
  attachmentFileUrl: string | null;
  createdAt: string;
  updatedAt: string;
  replies: BoardReplyItem[];
  comments: BoardCommentItem[];
};

export type BoardReplyItem = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  attachmentFileName: string | null;
  attachmentFileUrl: string | null;
  createdAt: string;
};

export type BoardCommentItem = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
};

export type GetBoardPostDetailResult =
  | { success: true; post: BoardPostDetail }
  | { success: false; message: string };

export type GetBoardPostForEditResult =
  | {
      success: true;
      post: {
        id: string;
        boardType: BoardType;
        title: string;
        content: string;
        authorName: string;
        isNotice: boolean;
        attachmentFileName: string;
        attachmentFileUrl: string;
      };
    }
  | { success: false; message: string };
