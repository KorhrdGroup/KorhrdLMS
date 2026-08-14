import { createClient } from "@/lib/supabase/server";

/**
 * 홈 메인 배너 관리 — 어드민 등록·순서·공개/숨김·삭제와 학생 홈 조회.
 * 배너가 하나도 없으면 학생 홈은 기존 하드코딩 배너로 폴백합니다.
 */

export type HomeBanner = {
  id: string;
  imageUrl: string;
  alt: string;
  linkUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
};

type BannerRow = {
  id: string;
  image_url: string;
  alt: string;
  link_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
};

function toBanner(row: BannerRow): HomeBanner {
  return {
    id: row.id,
    imageUrl: row.image_url,
    alt: row.alt,
    linkUrl: row.link_url,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    createdAt: row.created_at.slice(0, 10),
  };
}

/** 학생 홈에 보여줄 공개 배너 (순서대로) */
export async function listPublishedHomeBanners(): Promise<HomeBanner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banners")
    .select("id, image_url, alt, link_url, sort_order, is_published, created_at")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as BannerRow[]).map(toBanner);
}

/** 어드민 목록 — 숨김 배너 포함 */
export async function listAdminHomeBanners(): Promise<HomeBanner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banners")
    .select("id, image_url, alt, link_url, sort_order, is_published, created_at")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as BannerRow[]).map(toBanner);
}

export type BannerMutationResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function createHomeBanner(input: {
  imageUrl: string;
  alt: string;
  linkUrl: string | null;
}): Promise<BannerMutationResult> {
  if (!input.imageUrl.trim()) {
    return { success: false, message: "배너 이미지를 업로드해주세요." };
  }

  const supabase = await createClient();
  // 새 배너는 맨 뒤에 붙입니다
  const { data: last } = await supabase
    .from("home_banners")
    .select("sort_order")
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("home_banners").insert({
    image_url: input.imageUrl.trim(),
    alt: input.alt.trim(),
    link_url: input.linkUrl?.trim() || null,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error) return { success: false, message: `등록에 실패했습니다: ${error.message}` };
  return { success: true, message: "배너를 등록했습니다." };
}

export async function updateHomeBanner(
  bannerId: string,
  input: { alt?: string; linkUrl?: string | null; isPublished?: boolean },
): Promise<BannerMutationResult> {
  const payload: {
    updated_at: string;
    alt?: string;
    link_url?: string | null;
    is_published?: boolean;
  } = { updated_at: new Date().toISOString() };
  if (input.alt !== undefined) payload.alt = input.alt.trim();
  if (input.linkUrl !== undefined) payload.link_url = input.linkUrl?.trim() || null;
  if (input.isPublished !== undefined) payload.is_published = input.isPublished;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banners")
    .update(payload)
    .eq("id", bannerId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, message: `수정에 실패했습니다: ${error.message}` };
  if (!data) return { success: false, message: "배너를 찾을 수 없습니다." };
  return { success: true, message: "배너를 수정했습니다." };
}

export async function deleteHomeBanner(bannerId: string): Promise<BannerMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banners")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", bannerId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, message: `삭제에 실패했습니다: ${error.message}` };
  if (!data) return { success: false, message: "배너를 찾을 수 없습니다." };
  return { success: true, message: "배너를 삭제했습니다." };
}

/** 순서 이동 — 위/아래 인접 배너와 sort_order를 맞바꿉니다 */
export async function moveHomeBanner(
  bannerId: string,
  direction: "up" | "down",
): Promise<BannerMutationResult> {
  const banners = await listAdminHomeBanners();
  const index = banners.findIndex((banner) => banner.id === bannerId);
  if (index < 0) return { success: false, message: "배너를 찾을 수 없습니다." };

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= banners.length) {
    return { success: true, message: "이미 끝입니다." };
  }

  const a = banners[index];
  const b = banners[targetIndex];
  // sort_order 값이 같아 순서가 안 바뀌는 경우(초기 데이터)를 대비해 인덱스로 재부여
  const supabase = await createClient();
  const { error: e1 } = await supabase
    .from("home_banners")
    .update({ sort_order: targetIndex + 1 })
    .eq("id", a.id);
  const { error: e2 } = await supabase
    .from("home_banners")
    .update({ sort_order: index + 1 })
    .eq("id", b.id);

  if (e1 || e2) return { success: false, message: "순서 변경에 실패했습니다." };
  return { success: true, message: "순서를 변경했습니다." };
}
