import type { Notice } from "@/features/notice-management/types/notice.types";

/**
 * 공지사항(/admin/notices) Repository 계층입니다.
 *
 * 현재는 서버 메모리 Mock 배열로 동작합니다(서버 재시작 시 초기화).
 * 추후 Supabase 연동 시, 이 파일이 export하는 함수 시그니처는 그대로 둔 채
 * 내부 구현만 Supabase 쿼리로 교체하면 서비스 계층(services/*)은
 * 수정할 필요가 없습니다.
 */

function generateId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function buildSeedNotices(): Notice[] {
  const now = new Date();

  return [
    {
      id: generateId("notice"),
      title: "2026년 2학기 수강 안내",
      content:
        "2026년 2학기 수강 신청 일정을 안내드립니다. 자세한 사항은 첨부파일을 참고해주시기 바랍니다.",
      authorName: "관리자",
      isPinned: true,
      isPublished: true,
      viewCount: 128,
      attachment: { fileName: "수강안내_2026-2.pdf", fileSizeLabel: "1.1MB" },
      createdAt: addDays(now, -2),
      updatedAt: addDays(now, -2),
    },
    {
      id: generateId("notice"),
      title: "시스템 점검 안내 (7/5 새벽)",
      content: "서비스 안정화를 위한 정기 점검이 진행됩니다. 점검 시간 동안 서비스 이용이 제한됩니다.",
      authorName: "관리자",
      isPinned: true,
      isPublished: true,
      viewCount: 76,
      attachment: null,
      createdAt: addDays(now, -1),
      updatedAt: addDays(now, -1),
    },
    {
      id: generateId("notice"),
      title: "여름방학 특강 모집 안내",
      content: "여름방학 기간 진행되는 특강 프로그램 수강생을 모집합니다.",
      authorName: "관리자",
      isPinned: false,
      isPublished: true,
      viewCount: 54,
      attachment: { fileName: "특강모집요강.docx", fileSizeLabel: "640KB" },
      createdAt: addDays(now, -5),
      updatedAt: addDays(now, -5),
    },
    {
      id: generateId("notice"),
      title: "(작성중) 하반기 자격증 시험 일정",
      content: "하반기 자격증 시험 일정을 준비 중입니다.",
      authorName: "관리자",
      isPinned: false,
      isPublished: false,
      viewCount: 0,
      attachment: null,
      createdAt: addDays(now, -0.2),
      updatedAt: addDays(now, -0.2),
    },
  ];
}

let notices: Notice[] = buildSeedNotices();

export function listNotices(): Notice[] {
  return notices;
}

export function findNoticeById(noticeId: string): Notice | undefined {
  return notices.find((notice) => notice.id === noticeId);
}

export function listPublishedNotices(): Notice[] {
  return notices.filter((notice) => notice.isPublished);
}

export function createNoticeRecord(
  input: Omit<Notice, "id" | "createdAt" | "updatedAt" | "viewCount" | "authorName"> & {
    authorName: string;
  },
): Notice {
  const now = nowIso();
  const notice: Notice = {
    ...input,
    id: generateId("notice"),
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  notices = [notice, ...notices];
  return notice;
}

export function updateNoticeRecord(
  noticeId: string,
  patch: Partial<Omit<Notice, "id" | "createdAt" | "viewCount" | "authorName">>,
): Notice | undefined {
  let updated: Notice | undefined;

  notices = notices.map((notice) => {
    if (notice.id !== noticeId) {
      return notice;
    }

    updated = { ...notice, ...patch, updatedAt: nowIso() };
    return updated;
  });

  return updated;
}

export function deleteNoticeRecord(noticeId: string): boolean {
  const before = notices.length;
  notices = notices.filter((notice) => notice.id !== noticeId);
  return notices.length < before;
}

export function incrementNoticeViewCount(noticeId: string): void {
  notices = notices.map((notice) =>
    notice.id === noticeId ? { ...notice, viewCount: notice.viewCount + 1 } : notice,
  );
}
