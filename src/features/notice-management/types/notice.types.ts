/**
 * 관리자 공지사항(/admin/notices) Mock 데이터 타입 정의입니다.
 *
 * 추후 Supabase 연동 시 다음 구조에 맞춰 매핑할 수 있도록 설계했습니다.
 * - Notice → notices 테이블(id, title, content, author_name, is_pinned,
 *   is_published, view_count, attachment_file_name, attachment_file_url,
 *   created_at, updated_at)
 *
 * `repositories/notice.repository.ts`의 함수 시그니처만 유지한 채
 * 내부 구현을 Mock 배열 → Supabase 쿼리로 교체하면, 서비스/액션/컴포넌트
 * 레이어는 변경하지 않아도 되도록 설계했습니다.
 *
 * 학생 화면과의 연동 지점:
 * - 사이트 공지사항(`/notice`, `src/components/notice/data/notice-data.ts`의
 *   `NoticeListItem`)과 필드 의미를 맞췄습니다: title↔title, isPinned↔pinned,
 *   content↔body, createdAt↔date.
 * - 학습강의실 공지사항(`/classroom/[slug]/notices`,
 *   `src/components/classroom/data/course-notice-data.ts`의 `CourseNotice`)과도
 *   맞췄습니다: title↔title, content↔content, authorName↔createdBy,
 *   createdAt↔createdAt.
 * `services/notice-student-view.service.ts`에서 위 두 화면이 바로 사용할 수 있는
 * 형태의 조회 함수를 제공합니다.
 */
export type NoticeAttachmentInput = {
  fileName: string;
  fileSizeLabel: string;
  /** Supabase Storage 공개 URL. 실제 업로드가 끝난 뒤 채워집니다. */
  fileUrl?: string | null;
  /** Storage 오브젝트 경로(교체/삭제 정리용). */
  storagePath?: string | null;
};

/** 학생 공지사항 필터 탭과 같은 값입니다. null(분류 없음)이면 "전체"에서만 보입니다. */
export const NOTICE_CATEGORY_OPTIONS = ["수강 안내", "신규 과정", "이벤트"] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORY_OPTIONS)[number];

export type Notice = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  authorName: string;
  isPinned: boolean;
  isPublished: boolean;
  viewCount: number;
  attachment: NoticeAttachmentInput | null;
  /** 본문 이미지(있으면 학생 화면 본문에 그대로 렌더링). 첨부파일과 별개입니다. */
  image: NoticeAttachmentInput | null;
  createdAt: string;
  updatedAt: string;
};

export type NoticeListItem = {
  id: string;
  title: string;
  authorName: string;
  isPinned: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
};

export type NoticePublishFilter = "" | "published" | "unpublished";
export type NoticePinnedFilter = "" | "pinned" | "unpinned";

export type NoticeListQuery = {
  page: number;
  pageSize: number;
  search: string;
  publish: NoticePublishFilter;
  pinned: NoticePinnedFilter;
};

export type NoticeRegistrationInput = {
  title: string;
  content: string;
  /** 분류(수강 안내/신규 과정/이벤트). 빈 문자열이면 분류 없음(null)으로 저장합니다. */
  category: string;
  attachment: NoticeAttachmentInput | null;
  /** 본문 이미지(렌더링용). 첨부파일(다운로드용)과 구분됩니다. */
  image: NoticeAttachmentInput | null;
  isPinned: boolean;
  isPublished: boolean;
};

export type NoticeRegistrationResult =
  | { success: true; noticeId: string; message: string }
  | { success: false; message: string; field?: keyof NoticeRegistrationInput };

export type NoticeEditInput = NoticeRegistrationInput;

export type NoticeEditDetail = NoticeEditInput & {
  id: string;
  authorName: string;
  viewCount: number;
};

export type NoticeEditResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof NoticeEditInput };

export type GetNoticeForEditResult =
  | { success: true; notice: NoticeEditDetail }
  | { success: false; message: string };

export type NoticeDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
