import type { Metadata } from "next";

import { EnrollmentPage } from "@/components/enrollment/enrollment-page";
import {
  getActiveEnrollmentCategories,
  getEnrollmentCatalogCourses,
} from "@/features/enrollment-catalog/services/enrollment-catalog.service";
import type {
  EnrollmentCatalogCategory,
  EnrollmentCatalogCourse,
} from "@/features/enrollment-catalog/types/enrollment-catalog.types";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "수강신청",
  description: "한평생직업훈련 수강신청",
};

type EnrollmentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadEnrollmentCatalog(): Promise<{
  courses: EnrollmentCatalogCourse[];
  categories: EnrollmentCatalogCategory[];
  loadError?: string;
}> {
  try {
    const [courses, categories] = await Promise.all([
      getEnrollmentCatalogCourses(),
      getActiveEnrollmentCategories(),
    ]);

    return { courses, categories };
  } catch {
    return {
      courses: [],
      categories: [],
      loadError: "과정 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}

export default async function Page({ searchParams }: EnrollmentPageProps) {
  const params = await searchParams;
  const selectParam = params.select;
  const initialSelectedSlug = Array.isArray(selectParam) ? selectParam[0] : selectParam;
  const member = await getMockableStudentMember();
  const isLoggedIn = Boolean(member);

  const { courses, categories, loadError } = await loadEnrollmentCatalog();

  return (
    <EnrollmentPage
      courses={courses}
      categories={categories}
      initialSelectedSlug={initialSelectedSlug}
      isLoggedIn={isLoggedIn}
      loadError={loadError}
    />
  );
}
