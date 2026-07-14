export type NoticePopupListQuery = {
  page: number;
  pageSize: number;
  search: string;
  isActive: "" | "true" | "false";
  isNotice: "" | "true" | "false";
};

export type NoticePopupListItem = {
  id: string;
  title: string;
  isActive: boolean;
  isNotice: boolean;
  attachmentFileName: string | null;
  displayStartDate: string | null;
  displayEndDate: string | null;
  sortOrder: number;
  createdAt: string;
};

export type NoticePopupDetail = {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  isNotice: boolean;
  attachmentFileName: string | null;
  attachmentFileUrl: string | null;
  displayStartDate: string | null;
  displayEndDate: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type GetNoticePopupForEditResult =
  | {
      success: true;
      popup: {
        id: string;
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
    }
  | { success: false; message: string };
