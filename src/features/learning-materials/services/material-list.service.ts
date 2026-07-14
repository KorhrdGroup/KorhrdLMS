import { listMaterials } from "@/features/learning-materials/repositories/material.repository";
import type {
  Material,
  MaterialCourseOption,
  MaterialFilterOptions,
  MaterialListItem,
  MaterialListQuery,
} from "@/features/learning-materials/types/material.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

function toListItem(material: Material): MaterialListItem {
  return {
    id: material.id,
    courseId: material.courseId,
    courseName: material.courseName,
    title: material.title,
    fileType: material.fileType,
    isPublished: material.isPublished,
    createdAt: material.createdAt,
  };
}

export async function fetchMaterialCourseOptions(): Promise<MaterialCourseOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, code")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getMaterialList(
  query: MaterialListQuery,
): Promise<PaginatedResult<MaterialListItem>> {
  let items = (await listMaterials()).map(toListItem);

  if (query.courseId) {
    items = items.filter((item) => item.courseId === query.courseId);
  }

  if (query.fileType) {
    items = items.filter((item) => item.fileType === query.fileType);
  }

  if (query.publish === "published") {
    items = items.filter((item) => item.isPublished);
  } else if (query.publish === "unpublished") {
    items = items.filter((item) => !item.isPublished);
  }

  if (query.search) {
    const keyword = query.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.courseName.toLowerCase().includes(keyword),
    );
  }

  items = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const total = items.length;
  const { from, to } = getPaginationRange(query.page, query.pageSize);
  const data = items.slice(from, to + 1);

  return {
    data,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getMaterialFilterOptions(): Promise<MaterialFilterOptions> {
  const courses = await fetchMaterialCourseOptions();
  return { courses };
}
