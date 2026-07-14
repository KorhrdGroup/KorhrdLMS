export const NOTICE_POPUP_LIST_SELECT = `
  id,
  title,
  content,
  is_active,
  is_notice,
  attachment_file_name,
  attachment_file_url,
  display_start_date,
  display_end_date,
  sort_order,
  created_at
` as const;

export const NOTICE_POPUP_DETAIL_SELECT = `
  id,
  title,
  content,
  is_active,
  is_notice,
  attachment_file_name,
  attachment_file_url,
  display_start_date,
  display_end_date,
  sort_order,
  created_at,
  updated_at
` as const;
