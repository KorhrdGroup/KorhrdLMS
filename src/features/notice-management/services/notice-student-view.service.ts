import { listPublishedNotices } from "@/features/notice-management/repositories/notice.repository";

/**
 * 학생 화면(고객센터 › 공지사항 `/support`, 학습강의실 공지사항
 * `/classroom/[slug]/notices`)과의 연동 지점입니다.
 *
 * 고객센터 공지사항은 이 모듈을 통해 어드민 공지 DB를 그대로 읽습니다.
 * 학습강의실 공지사항은 아직 Mock 데이터 파일
 * (`src/components/classroom/data/course-notice-data.ts`)을 쓰고 있습니다.
 * 아래 두 함수는 그 화면이 기대하는 타입과 동일한 형태로 데이터를 돌려주도록
 * 설계되어, 전환할 때 조회 함수만 교체하면 되도록(드롭인) 만들었습니다.
 */

export type SiteNoticeListItem = {
  id: string;
  no: number | null;
  pinned: boolean;
  title: string;
  /** 분류(수강 안내/신규 과정/이벤트). null 이면 "전체" 탭에서만 보입니다. */
  category: string | null;
  date: string;
  body: string;
  /** 첨부파일(있을 때만). 학생 화면에서 다운로드 링크로 노출합니다. */
  attachment: { fileName: string; fileSizeLabel: string; fileUrl: string } | null;
  /** 본문 이미지(있을 때만). 본문 아래에 그대로 렌더링합니다. */
  imageUrl: string | null;
  /** 본문 이미지 클릭 시 이동할 링크(선택). */
  imageLinkUrl: string | null;
};

export async function getPublishedNoticesForSite(): Promise<SiteNoticeListItem[]> {
  const notices = await listPublishedNotices();

  const sorted = [...notices].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  return sorted.map((notice, index) => ({
    id: notice.id,
    no: sorted.length - index,
    pinned: notice.isPinned,
    title: notice.title,
    category: notice.category,
    date: notice.createdAt.slice(0, 10),
    body: notice.content,
    attachment:
      notice.attachment && notice.attachment.fileUrl
        ? {
            fileName: notice.attachment.fileName,
            fileSizeLabel: notice.attachment.fileSizeLabel,
            fileUrl: notice.attachment.fileUrl,
          }
        : null,
    imageUrl: notice.image?.fileUrl ?? null,
    imageLinkUrl: notice.imageLinkUrl,
  }));
}

export type ClassroomNoticeItem = {
  id: string;
  seq: number;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
};

/**
 * 과정별 공지사항이 아직 없는 학습강의실에서, 전체 공지(관리자 공지사항)를
 * 공통으로 노출하고 싶을 때 사용할 수 있는 함수입니다.
 */
export async function getPublishedNoticesForClassroom(): Promise<ClassroomNoticeItem[]> {
  const notices = await listPublishedNotices();

  const sorted = [...notices].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return sorted.map((notice, index) => ({
    id: notice.id,
    seq: sorted.length - index,
    title: notice.title,
    content: notice.content,
    createdAt: notice.createdAt.slice(0, 10),
    createdBy: notice.authorName,
  }));
}
