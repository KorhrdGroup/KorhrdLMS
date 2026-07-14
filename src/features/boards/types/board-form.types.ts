export type BoardPostInput = {
  title: string;
  content: string;
  authorName: string;
  isNotice: boolean;
  attachmentFileName: string;
  attachmentFileUrl: string;
};

export type BoardReplyInput = {
  content: string;
  authorName: string;
  attachmentFileName: string;
  attachmentFileUrl: string;
};

export type BoardCommentInput = {
  content: string;
  authorName: string;
};

export type BoardMutationResult =
  | { success: true; message: string; postId?: string }
  | { success: false; message: string; field?: keyof BoardPostInput };

export type BoardCommentMutationResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof BoardCommentInput };

export type BoardReplyMutationResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof BoardReplyInput };

export type BoardDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
