import type { BoardType } from "@/types/database.types";

export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  consultation: "1:1 상담",
  notice: "공지사항",
  free: "자유게시판",
  resource: "자료실",
  faq: "FAQ",
};

export const BOARD_NAV_ITEMS = [
  { boardType: "consultation" as const, label: BOARD_TYPE_LABELS.consultation },
  { boardType: "notice" as const, label: BOARD_TYPE_LABELS.notice },
  { boardType: "free" as const, label: BOARD_TYPE_LABELS.free },
  { boardType: "resource" as const, label: BOARD_TYPE_LABELS.resource },
  { boardType: "faq" as const, label: BOARD_TYPE_LABELS.faq },
];

export const BOARD_LIST_SELECT = `
  id,
  board_type,
  parent_id,
  title,
  content,
  author_name,
  is_notice,
  attachment_file_name,
  attachment_file_url,
  created_at
` as const;

export const BOARD_DETAIL_SELECT = `
  id,
  board_type,
  parent_id,
  title,
  content,
  author_name,
  is_notice,
  attachment_file_name,
  attachment_file_url,
  created_at,
  updated_at
` as const;

export const BOARD_REPLY_SELECT = `
  id,
  parent_id,
  title,
  content,
  author_name,
  attachment_file_name,
  attachment_file_url,
  created_at
` as const;

export const BOARD_COMMENT_SELECT = `
  id,
  post_id,
  content,
  author_name,
  created_at
` as const;

export const DEFAULT_BOARD_AUTHOR = "관리자";
