import { createClient } from "@/lib/supabase/server";

import type {
  ProfessorDeleteResult,
  ProfessorFormInput,
  ProfessorListItem,
  ProfessorMutationResult,
} from "../types/professor.types";

function normalizeBio(bio: string[]): string[] {
  return bio.map((line) => line.trim()).filter((line) => line.length > 0);
}

function validate(input: ProfessorFormInput): ProfessorMutationResult {
  if (!input.name.trim()) {
    return { success: false, message: "교수명을 입력해주세요.", field: "name" };
  }
  return { success: true, message: "" };
}

async function isNameTaken(name: string, excludeId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("professors")
    .select("id")
    .eq("name", name.trim())
    .is("deleted_at", null);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return !!data;
}

export async function getProfessorList(): Promise<ProfessorListItem[]> {
  const supabase = await createClient();

  const [professorsResult, coursesResult] = await Promise.all([
    supabase
      .from("professors")
      .select("id, name, bio, photo_url, created_at")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("courses")
      .select("professor_id")
      .not("professor_id", "is", null)
      .is("deleted_at", null),
  ]);

  if (professorsResult.error) {
    throw new Error(professorsResult.error.message);
  }
  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  const countByProfessor = new Map<string, number>();
  for (const row of coursesResult.data ?? []) {
    if (!row.professor_id) continue;
    countByProfessor.set(row.professor_id, (countByProfessor.get(row.professor_id) ?? 0) + 1);
  }

  return (professorsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    bio: row.bio ?? [],
    photoUrl: row.photo_url,
    courseCount: countByProfessor.get(row.id) ?? 0,
    createdAt: row.created_at,
  }));
}

export async function createProfessor(
  input: ProfessorFormInput,
): Promise<ProfessorMutationResult> {
  const validation = validate(input);
  if (!validation.success) {
    return validation;
  }

  if (await isNameTaken(input.name)) {
    return { success: false, message: "이미 등록된 교수명입니다.", field: "name" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("professors").insert({
    name: input.name.trim(),
    bio: normalizeBio(input.bio),
    photo_url: input.photoUrl.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: `"${input.name.trim()}" 교수를 등록했습니다.` };
}

export async function updateProfessor(
  id: string,
  input: ProfessorFormInput,
): Promise<ProfessorMutationResult> {
  const validation = validate(input);
  if (!validation.success) {
    return validation;
  }

  if (await isNameTaken(input.name, id)) {
    return { success: false, message: "이미 등록된 교수명입니다.", field: "name" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professors")
    .update({
      name: input.name.trim(),
      bio: normalizeBio(input.bio),
      photo_url: input.photoUrl.trim() || null,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select("name")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return { success: false, message: "교수 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: `"${data.name}" 교수 정보를 수정했습니다.` };
}

export async function deleteProfessor(id: string): Promise<ProfessorDeleteResult> {
  const supabase = await createClient();

  // 담당 과정이 남아 있으면 상세페이지 교수 소개가 비어버리므로 막습니다.
  const { count, error: countError } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("professor_id", id)
    .is("deleted_at", null);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) > 0) {
    return {
      success: false,
      message: `담당 과정이 ${count}개 있어 삭제할 수 없습니다. 과정수정 > 상세페이지 탭에서 담당 교수를 먼저 변경해주세요.`,
    };
  }

  const { data, error } = await supabase
    .from("professors")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null)
    .select("name")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return { success: false, message: "교수 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: `"${data.name}" 교수를 삭제했습니다.` };
}
