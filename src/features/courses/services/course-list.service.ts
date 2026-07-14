import {
  COURSE_LIST_SELECT,
  type CourseSearchField,
} from "@/features/courses/constants";
import type { CourseListItem } from "@/features/courses/types/course.types";
import type { ListQuery, PaginatedResult } from "@/lib/shared/list-query";
import {
  getPaginationRange,
  getTotalPages,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

export type CourseListQuery = Omit<ListQuery, "field"> & {
  field: CourseSearchField;
};

async function findCategoryIdsByNameKeyword(
  supabase: Awaited<ReturnType<typeof createClient>>,
  keyword: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("course_categories")
    .select("id")
    .ilike("name", keyword);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.id);
}

export async function getCourseList(
  query: CourseListQuery,
): Promise<PaginatedResult<CourseListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("courses")
    .select(COURSE_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (query.search) {
    const keyword = `%${query.search}%`;

    switch (query.field) {
      case "name":
        builder = builder.ilike("name", keyword);
        break;
      case "code":
        builder = builder.ilike("code", keyword);
        break;
      case "category": {
        const categoryIds = await findCategoryIdsByNameKeyword(supabase, keyword);
        builder = builder.in("category_id", categoryIds.length > 0 ? categoryIds : [""]);
        break;
      }
      default: {
        const categoryIds = await findCategoryIdsByNameKeyword(supabase, keyword);
        const categoryFilter =
          categoryIds.length > 0
            ? `,category_id.in.(${categoryIds.join(",")})`
            : "";
        builder = builder.or(`name.ilike.${keyword},code.ilike.${keyword}${categoryFilter}`);
        break;
      }
    }
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;
  const courses = (data ?? []) as CourseListItem[];
  const categoryNameById = await getCategoryNameMap(
    supabase,
    courses.map((course) => course.category_id),
  );

  return {
    data: courses.map((course) => ({
      ...course,
      categoryName: course.category_id ? (categoryNameById.get(course.category_id) ?? null) : null,
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

async function getCategoryNameMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryIds: (string | null)[],
): Promise<Map<string, string>> {
  const ids = Array.from(new Set(categoryIds.filter((id): id is string => Boolean(id))));

  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.from("course_categories").select("id, name").in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.id, row.name]));
}
