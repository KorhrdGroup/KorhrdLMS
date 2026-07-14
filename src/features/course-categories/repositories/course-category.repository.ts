import { COURSE_CATEGORY_LIST_SELECT } from "@/features/course-categories/constants";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type CourseCategoryRow = Database["public"]["Tables"]["course_categories"]["Row"];

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function listCourseCategories(): Promise<CourseCategoryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_categories")
    .select(COURSE_CATEGORY_LIST_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CourseCategoryRow[];
}

/** 카테고리별로 연결된(미삭제) 과정 수를 센다. 삭제 전 사용여부 확인에 사용합니다. */
export async function countCoursesByCategoryId(): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("category_id")
    .is("deleted_at", null)
    .not("category_id", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { category_id: string | null }[]) {
    if (!row.category_id) continue;
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  return counts;
}

export async function findCourseCategoryBySlug(
  supabase: SupabaseServerClient,
  slug: string,
  excludeId?: string,
): Promise<CourseCategoryRow | null> {
  let builder = supabase.from("course_categories").select(COURSE_CATEGORY_LIST_SELECT).eq("slug", slug);

  if (excludeId) {
    builder = builder.neq("id", excludeId);
  }

  const { data, error } = await builder.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CourseCategoryRow | null) ?? null;
}

export async function insertCourseCategory(
  supabase: SupabaseServerClient,
  input: Database["public"]["Tables"]["course_categories"]["Insert"],
): Promise<CourseCategoryRow> {
  const { data, error } = await supabase
    .from("course_categories")
    .insert(input)
    .select(COURSE_CATEGORY_LIST_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CourseCategoryRow;
}

export async function updateCourseCategory(
  supabase: SupabaseServerClient,
  id: string,
  input: Database["public"]["Tables"]["course_categories"]["Update"],
): Promise<CourseCategoryRow | null> {
  const { data, error } = await supabase
    .from("course_categories")
    .update(input)
    .eq("id", id)
    .select(COURSE_CATEGORY_LIST_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CourseCategoryRow | null) ?? null;
}

export async function deleteCourseCategory(supabase: SupabaseServerClient, id: string) {
  const { error } = await supabase.from("course_categories").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function findCourseCategoryById(
  supabase: SupabaseServerClient,
  id: string,
): Promise<CourseCategoryRow | null> {
  const { data, error } = await supabase
    .from("course_categories")
    .select(COURSE_CATEGORY_LIST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CourseCategoryRow | null) ?? null;
}
