import { COMMON_MATERIAL_COURSE_NAME } from "@/features/learning-materials/constants";
import type { Material } from "@/features/learning-materials/types/material.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * 자료실(/admin/learning-materials) Repository 계층입니다.
 *
 * Supabase `learning_materials` 테이블을 사용합니다. `course_id`가 null이면
 * "전체 공통" 자료로 취급합니다(courseName은 조회 시점에 courses 테이블과
 * 조인해 채워집니다).
 */

type MaterialRow = Database["public"]["Tables"]["learning_materials"]["Row"];
type CourseNameRow = { id: string; name: string };

function toMaterial(row: MaterialRow, courseName: string): Material {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName,
    title: row.title,
    description: row.description,
    fileType: row.file_type,
    fileName: row.file_name,
    fileSizeLabel: row.file_size_label ?? "",
    fileUrl: row.file_url,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchCourseNameMap(courseIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(courseIds)];
  const map = new Map<string, string>();

  if (uniqueIds.length === 0) {
    return map;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const course of (data ?? []) as CourseNameRow[]) {
    map.set(course.id, course.name);
  }

  return map;
}

export async function listMaterials(): Promise<Material[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_materials")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as MaterialRow[];
  const courseIds = rows
    .map((row) => row.course_id)
    .filter((id): id is string => Boolean(id));
  const courseNameMap = await fetchCourseNameMap(courseIds);

  return rows.map((row) =>
    toMaterial(row, row.course_id ? (courseNameMap.get(row.course_id) ?? "") : COMMON_MATERIAL_COURSE_NAME),
  );
}

export async function findMaterialById(materialId: string): Promise<Material | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_materials")
    .select("*")
    .eq("id", materialId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return undefined;
  }

  const row = data as MaterialRow;
  const courseName = row.course_id
    ? (await fetchCourseNameMap([row.course_id])).get(row.course_id) ?? ""
    : COMMON_MATERIAL_COURSE_NAME;

  return toMaterial(row, courseName);
}

/**
 * 학생 학습강의실 자료실 조회용: 특정 과정 전용 자료 + 전체 공통(course_id=null)
 * 자료 중 공개(is_published=true) 상태인 것만 반환합니다.
 */
export async function findPublishedMaterialsByCourseId(courseId: string): Promise<Material[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_materials")
    .select("*")
    .is("deleted_at", null)
    .eq("is_published", true)
    .or(`course_id.eq.${courseId},course_id.is.null`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as MaterialRow[];
  const courseIds = rows
    .map((row) => row.course_id)
    .filter((id): id is string => Boolean(id));
  const courseNameMap = await fetchCourseNameMap(courseIds);

  return rows.map((row) =>
    toMaterial(row, row.course_id ? (courseNameMap.get(row.course_id) ?? "") : COMMON_MATERIAL_COURSE_NAME),
  );
}

export async function createMaterialRecord(
  input: Omit<Material, "id" | "createdAt" | "updatedAt" | "courseName">,
): Promise<Material> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_materials")
    .insert({
      course_id: input.courseId,
      title: input.title,
      description: input.description,
      file_type: input.fileType,
      file_name: input.fileName,
      file_size_label: input.fileSizeLabel,
      file_url: input.fileUrl,
      is_published: input.isPublished,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as MaterialRow;
  const courseName = row.course_id
    ? (await fetchCourseNameMap([row.course_id])).get(row.course_id) ?? ""
    : COMMON_MATERIAL_COURSE_NAME;

  return toMaterial(row, courseName);
}

export async function updateMaterialRecord(
  materialId: string,
  patch: Partial<Omit<Material, "id" | "createdAt" | "courseName">>,
): Promise<Material | undefined> {
  const supabase = await createClient();

  const updatePayload: Database["public"]["Tables"]["learning_materials"]["Update"] = {};
  if (patch.courseId !== undefined) updatePayload.course_id = patch.courseId;
  if (patch.title !== undefined) updatePayload.title = patch.title;
  if (patch.description !== undefined) updatePayload.description = patch.description;
  if (patch.fileType !== undefined) updatePayload.file_type = patch.fileType;
  if (patch.fileName !== undefined) updatePayload.file_name = patch.fileName;
  if (patch.fileSizeLabel !== undefined) updatePayload.file_size_label = patch.fileSizeLabel;
  if (patch.fileUrl !== undefined) updatePayload.file_url = patch.fileUrl;
  if (patch.isPublished !== undefined) updatePayload.is_published = patch.isPublished;

  const { data, error } = await supabase
    .from("learning_materials")
    .update(updatePayload)
    .eq("id", materialId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return undefined;
  }

  const row = data as MaterialRow;
  const courseName = row.course_id
    ? (await fetchCourseNameMap([row.course_id])).get(row.course_id) ?? ""
    : COMMON_MATERIAL_COURSE_NAME;

  return toMaterial(row, courseName);
}

export async function deleteMaterialRecord(materialId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_materials")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", materialId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
