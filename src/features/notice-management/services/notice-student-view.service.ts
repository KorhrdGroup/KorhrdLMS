import { listPublishedNotices } from "@/features/notice-management/repositories/notice.repository";

/**
 * 학생 화면(사이트 공지사항 `/notice`, 학습강의실 공지사항
 * `/classroom/[slug]/notices`)과의 연동 지점입니다.
 *
 * 현재 두 학생 화면은 각각 별도의 Mock 데이터 파일
 * (`src/components/notice/data/notice-data.ts`,
 * `src/components/classroom/data/course-notice-data.ts`)을 사용하고 있습니다.
 * 아래 두 함수는 그 화면들이 기대하는 타입과 동일한 형태로 데이터를 반환하도록
 * 설계되어, 추후 해당 페이지들을 이 모듈(또는 Supabase `notices` 테이블)로
 * 전환할 때 조회 함수만 교체하면 되도록(드롭인) 만들었습니다.
 */

export type SiteNoticeListItem = {
  id: string;
  no: number | null;
  pinned: boolean;
  title: string;
  date: string;
  body: string;
};

export async function getPublishedNoticesForSite(): Promise<SiteNoticeListItem[]> {
  const notices = listPublishedNotices();

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
    date: notice.createdAt.slice(0, 10),
    body: notice.content,
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
  const notices = listPublishedNotices();

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
