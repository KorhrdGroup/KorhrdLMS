import type { Metadata } from "next";

import { getActiveCourseCategoryOptions } from "@/features/course-categories/services/course-category.service";
import { CourseListView } from "@/features/courses/components/course-list-view";
import { parseCourseListQuery } from "@/features/courses/lib/course-list-query";
import { getCourseList } from "@/features/courses/services/course-list.service";

export const metadata: Metadata = {
  title: "과정 목록",
};

type CoursesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadCourseListPageData(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const query = parseCourseListQuery(searchParams);

  try {
    const [result, categoryOptions] = await Promise.all([
      getCourseList(query),
      getActiveCourseCategoryOptions(),
    ]);

    return { success: true as const, query, result, categoryOptions };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "과정 목록을 불러오지 못했습니다.";

    return { success: false as const, message };
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const data = await loadCourseListPageData(params);

  if (!data.success) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">과정 목록</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{data.message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return (
    <CourseListView
      result={data.result}
      query={data.query}
      categoryOptions={data.categoryOptions}
    />
  );
}
