import type { Metadata } from "next";

import { CourseCategoryListView } from "@/features/course-categories/components/course-category-list-view";
import { getCourseCategoryList } from "@/features/course-categories/services/course-category.service";

export const metadata: Metadata = {
  title: "카테고리관리 | 과정관리",
};

async function loadCourseCategoryList() {
  try {
    const categories = await getCourseCategoryList();
    return { success: true as const, categories };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "카테고리 목록을 불러오지 못했습니다.";
    return { success: false as const, message };
  }
}

export default async function CourseCategoriesPage() {
  const result = await loadCourseCategoryList();

  if (!result.success) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">카테고리관리</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{result.message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return <CourseCategoryListView categories={result.categories} />;
}
