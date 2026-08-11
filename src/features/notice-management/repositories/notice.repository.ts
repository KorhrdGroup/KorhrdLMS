import type { Notice } from "@/features/notice-management/types/notice.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * 공지사항(/admin/notices) Repository 계층입니다.
 *
 * Supabase `notices` 테이블을 사용합니다. 관리자 화면에서 등록/수정한 공지가
 * 학생 화면(`/notice`)에도 그대로 노출됩니다.
 */

const NOTICE_SELECT =
  "id, title, content, category, author_name, is_pinned, is_published, view_count, attachment_file_name, attachment_file_size_label, attachment_file_url, attachment_storage_path, image_file_name, image_file_url, image_storage_path, created_at, updated_at" as const;

type NoticeRow = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  author_name: string;
  is_pinned: boolean;
  is_published: boolean;
  view_count: number;
  attachment_file_name: string | null;
  attachment_file_size_label: string | null;
  attachment_file_url: string | null;
  attachment_storage_path: string | null;
  image_file_name: string | null;
  image_file_url: string | null;
  image_storage_path: string | null;
  created_at: string;
  updated_at: string;
};

function toNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    authorName: row.author_name,
    isPinned: row.is_pinned,
    isPublished: row.is_published,
    viewCount: row.view_count,
    attachment: row.attachment_file_name
      ? {
          fileName: row.attachment_file_name,
          fileSizeLabel: row.attachment_file_size_label ?? "",
          fileUrl: row.attachment_file_url,
          storagePath: row.attachment_storage_path,
        }
      : null,
    image: row.image_file_name
      ? {
          fileName: row.image_file_name,
          fileSizeLabel: "",
          fileUrl: row.image_file_url,
          storagePath: row.image_storage_path,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 고정 공지를 먼저, 그다음 최신순으로 정렬합니다. */
function sortNotices(rows: NoticeRow[]) {
  return [...rows].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    return a.created_at < b.created_at ? 1 : -1;
  });
}

export async function listNotices(): Promise<Notice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return sortNotices((data ?? []) as NoticeRow[]).map(toNotice);
}

export async function findNoticeById(noticeId: string): Promise<Notice | undefined> {
  if (!noticeId.trim()) {
    return undefined;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_SELECT)
    .eq("id", noticeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toNotice(data as NoticeRow) : undefined;
}

export async function listPublishedNotices(): Promise<Notice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_SELECT)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return sortNotices((data ?? []) as NoticeRow[]).map(toNotice);
}

export async function createNoticeRecord(
  input: Omit<Notice, "id" | "createdAt" | "updatedAt" | "viewCount" | "authorName"> & {
    authorName: string;
  },
): Promise<Notice> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notices")
    .insert({
      title: input.title,
      content: input.content,
      category: input.category,
      author_name: input.authorName,
      is_pinned: input.isPinned,
      is_published: input.isPublished,
      attachment_file_name: input.attachment?.fileName ?? null,
      attachment_file_size_label: input.attachment?.fileSizeLabel ?? null,
      attachment_file_url: input.attachment?.fileUrl ?? null,
      attachment_storage_path: input.attachment?.storagePath ?? null,
      image_file_name: input.image?.fileName ?? null,
      image_file_url: input.image?.fileUrl ?? null,
      image_storage_path: input.image?.storagePath ?? null,
    })
    .select(NOTICE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toNotice(data as NoticeRow);
}

export async function updateNoticeRecord(
  noticeId: string,
  patch: Partial<Omit<Notice, "id" | "createdAt" | "viewCount" | "authorName">>,
): Promise<Notice | undefined> {
  const payload: Database["public"]["Tables"]["notices"]["Update"] = {};

  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.content !== undefined) payload.content = patch.content;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.isPinned !== undefined) payload.is_pinned = patch.isPinned;
  if (patch.isPublished !== undefined) payload.is_published = patch.isPublished;
  if (patch.attachment !== undefined) {
    payload.attachment_file_name = patch.attachment?.fileName ?? null;
    payload.attachment_file_size_label = patch.attachment?.fileSizeLabel ?? null;
    payload.attachment_file_url = patch.attachment?.fileUrl ?? null;
    payload.attachment_storage_path = patch.attachment?.storagePath ?? null;
  }
  if (patch.image !== undefined) {
    payload.image_file_name = patch.image?.fileName ?? null;
    payload.image_file_url = patch.image?.fileUrl ?? null;
    payload.image_storage_path = patch.image?.storagePath ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notices")
    .update(payload)
    .eq("id", noticeId)
    .is("deleted_at", null)
    .select(NOTICE_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toNotice(data as NoticeRow) : undefined;
}

/** 소프트 삭제(deleted_at)로 처리합니다. */
export async function deleteNoticeRecord(noticeId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notices")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", noticeId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function incrementNoticeViewCount(noticeId: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notices")
    .select("view_count")
    .eq("id", noticeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) {
    return;
  }

  await supabase
    .from("notices")
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq("id", noticeId);
}
