import { createClient } from "@/lib/supabase/server";

/**
 * 학생 1:1 상담(support QnA) 서비스.
 *
 * 저장소는 게시판 테이블(`board_posts`, board_type = 'consultation')을 그대로 사용해
 * 어드민 게시판관리(상담문의 탭)와 같은 데이터를 바라봅니다.
 * - 학생 질문: parent_id IS NULL, member_id = 작성한 회원
 * - 관리자 답변: 같은 board_type의 자식 글(parent_id = 질문 글 id)
 */
export type SupportQnaStatus = "pending" | "answered";

export type SupportQnaItem = {
  id: string;
  /** 화면 표시용 번호(최신 글이 큰 번호). */
  seq: number;
  title: string;
  content: string;
  authorName: string;
  status: SupportQnaStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
};

type PostRow = {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
};

type ReplyRow = {
  parent_id: string | null;
  content: string;
  created_at: string;
};

function formatDate(value: string) {
  return value.slice(0, 10);
}

/** 질문 글 id 목록에 대한 관리자 답변(자식 글)을 한 번에 조회합니다. */
async function getRepliesByPostIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postIds: string[],
) {
  if (postIds.length === 0) {
    return new Map<string, ReplyRow>();
  }

  const { data, error } = await supabase
    .from("board_posts")
    .select("parent_id, content, created_at")
    .in("parent_id", postIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, ReplyRow>();
  for (const row of (data ?? []) as ReplyRow[]) {
    // 답변이 여러 건이면 가장 최근 답변을 노출합니다.
    if (row.parent_id) {
      map.set(row.parent_id, row);
    }
  }
  return map;
}

function toItem(row: PostRow, seq: number, reply: ReplyRow | undefined): SupportQnaItem {
  return {
    id: row.id,
    seq,
    title: row.title,
    content: row.content,
    authorName: row.author_name,
    status: reply ? "answered" : "pending",
    adminReply: reply?.content ?? null,
    repliedAt: reply ? formatDate(reply.created_at) : null,
    createdAt: formatDate(row.created_at),
  };
}

/** 로그인한 회원 본인의 1:1 상담 목록(최신순). */
export async function getMySupportQnaList(memberId: string): Promise<SupportQnaItem[]> {
  if (!memberId.trim()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_posts")
    .select("id, title, content, author_name, created_at")
    .eq("board_type", "consultation")
    .eq("member_id", memberId)
    .is("parent_id", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as PostRow[];
  const replies = await getRepliesByPostIds(
    supabase,
    rows.map((row) => row.id),
  );

  // 최신 글이 가장 큰 번호를 갖도록 역순으로 번호를 매깁니다.
  return rows.map((row, index) => toItem(row, rows.length - index, replies.get(row.id)));
}

/** 본인 상담글 상세. 다른 회원의 글이면 null을 반환합니다. */
export async function getMySupportQnaDetail(
  memberId: string,
  postId: string,
): Promise<SupportQnaItem | null> {
  if (!memberId.trim() || !postId.trim()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_posts")
    .select("id, title, content, author_name, created_at")
    .eq("id", postId)
    .eq("board_type", "consultation")
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as PostRow;
  const replies = await getRepliesByPostIds(supabase, [row.id]);

  return toItem(row, 0, replies.get(row.id));
}

export type CreateSupportQnaResult =
  | { success: true; postId: string }
  | { success: false; message: string };

/** 1:1 상담 글 작성 — 어드민 게시판관리(상담문의)에 즉시 노출됩니다. */
export async function createSupportQna(input: {
  memberId: string;
  authorName: string;
  title: string;
  content: string;
}): Promise<CreateSupportQnaResult> {
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title) {
    return { success: false, message: "제목을 입력해주세요." };
  }

  if (!content) {
    return { success: false, message: "내용을 입력해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("board_posts")
    .insert({
      board_type: "consultation",
      title,
      content,
      author_name: input.authorName,
      member_id: input.memberId,
      is_notice: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, postId: data.id };
}
