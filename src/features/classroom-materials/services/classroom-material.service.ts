import { findPublishedMaterialsByCourseId } from "@/features/learning-materials/repositories/material.repository";
import type { Material } from "@/features/learning-materials/types/material.types";
import { resolveClassroomAccess } from "@/features/classroom-lectures/services/classroom-lecture.service";
import type {
  ClassroomMaterialDetailResult,
  ClassroomMaterialItem,
  ClassroomMaterialList,
} from "@/features/classroom-materials/types/classroom-material.types";
import { createClient } from "@/lib/supabase/server";

function toClassroomItem(material: Material, seq: number): ClassroomMaterialItem {
  return {
    id: material.id,
    seq,
    title: material.title,
    content: material.description,
    fileName: material.fileName,
    fileUrl: material.fileUrl,
    isCommon: material.courseId === null,
    createdBy: "관리자",
    createdAt: material.createdAt.slice(0, 10),
  };
}

/**
 * 학생 학습강의실 '학습자료실' 목록을 조회합니다.
 *
 * `resolveClassroomAccess`로 로그인한 학생이 해당 과정에 confirmed 상태로
 * 수강신청했는지 확인한 뒤에만 자료를 반환합니다(승인된 수강 과정 관련
 * 자료만 조회 가능). 접근할 수 없으면 null을 반환해 "존재하지 않는 과정"과
 * 동일하게 처리합니다.
 */
export async function getClassroomCourseMaterials(
  memberId: string,
  courseCode: string,
): Promise<ClassroomMaterialList | null> {
  if (!memberId.trim() || !courseCode.trim()) {
    return null;
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return null;
  }

  const materials = await findPublishedMaterialsByCourseId(access.course.id);
  const total = materials.length;

  return {
    courseId: access.course.id,
    courseCode: access.course.code,
    courseTitle: access.course.name,
    materials: materials.map((material, index) => toClassroomItem(material, total - index)),
  };
}

/**
 * 학생 학습강의실 '학습자료실' 상세를 조회합니다.
 *
 * 과정 접근 권한이 없으면 `{ success: false }`를 반환해 페이지에서
 * "존재하지 않는 과정" 안내를 표시하도록 합니다. 과정 접근은 가능하지만
 * 자료가 없거나(삭제/비공개) 다른 과정 전용 자료라면 `material: null`을
 * 반환해 "존재하지 않는 게시물" 안내를 표시하도록 합니다.
 */
export async function getClassroomMaterialDetail(
  memberId: string,
  courseCode: string,
  materialId: string,
): Promise<ClassroomMaterialDetailResult> {
  if (!memberId.trim() || !courseCode.trim() || !materialId.trim()) {
    return { success: false };
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return { success: false };
  }

  const materials = await findPublishedMaterialsByCourseId(access.course.id);
  const total = materials.length;
  const index = materials.findIndex((material) => material.id === materialId);

  if (index === -1) {
    return { success: true, courseTitle: access.course.name, material: null };
  }

  return {
    success: true,
    courseTitle: access.course.name,
    material: toClassroomItem(materials[index], total - index),
  };
}
