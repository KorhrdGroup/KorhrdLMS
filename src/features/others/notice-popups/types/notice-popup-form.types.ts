export type NoticePopupInput = {
  title: string;
  content: string;
  isActive: boolean;
  isNotice: boolean;
  attachmentFileName: string;
  attachmentFileUrl: string;
  displayStartDate: string;
  displayEndDate: string;
  sortOrder: number;
};

export type NoticePopupMutationResult =
  | { success: true; message: string; popupId?: string }
  | { success: false; message: string; field?: keyof NoticePopupInput };

export type NoticePopupDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
