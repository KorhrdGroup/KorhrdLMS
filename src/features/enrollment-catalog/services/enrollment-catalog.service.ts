import {
  ENROLLMENT_CATALOG_ALL_CATEGORY_ID,
  ENROLLMENT_CATALOG_CATEGORY_SELECT,
  ENROLLMENT_CATALOG_CLASS_SELECT,
  ENROLLMENT_CATALOG_COURSE_SELECT,
  ENROLLMENT_CATALOG_UNCATEGORIZED_LABEL,
} from "@/features/enrollment-catalog/constants";
import type {
  EnrollmentCatalogBadge,
  EnrollmentCatalogCategory,
  EnrollmentCatalogClass,
  EnrollmentCatalogCourse,
} from "@/features/enrollment-catalog/types/enrollment-catalog.types";
import { createClient } from "@/lib/supabase/server";

type CourseRow = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  category_id: string | null;
  description: string | null;
  default_duration_days: number | null;
  price: number;
  status: string;
  created_at: string;
  professor_name: string | null;
  study_method: string | null;
  lecture_time: string | null;
  supervising_agency: string | null;
  is_deadline_soon: boolean;
  regular_price: number;
  display_price: number;
  is_free_course: boolean;
  thumbnail_url: string | null;
};

type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
};

type ClassRow = {
  id: string;
  course_id: string;
  year: number;
  name: string;
  manager_name: string | null;
  application_start: string | null;
  application_end: string | null;
  enrollment_start: string;
  enrollment_end: string;
};

/**
 * 학생 수강신청 화면(`/enrollment`)에 노출할 과정 목록을 조회합니다.
 * - `courses`: 공개 상태(status = "active")이고 삭제되지 않은(deleted_at IS NULL) 과정을
 *   등록일(created_at) 최신순으로 모두 조회합니다. 백오피스 과정등록/수정에서 저장한
 *   데이터를 그대로 읽으므로, 새 과정을 등록하면 별도 반영 작업 없이 바로 노출됩니다.
 * - `classes`: `course_id` 기준으로 연결하고, 접수기간(application_start~application_end) 이내인
 *   수강반만 "신청 가능한 수강반"(classes)으로 채워 카드의 기수 정보/신청 가능 여부 판단에 사용합니다.
 *   신청 가능한 수강반이 아직 없는 과정도(예: 반 등록 전 신규 과정) 카드 자체는 그대로 노출되며,
 *   실제 신청 시점에만 "신청 가능한 수강반이 없습니다" 안내로 막습니다.
 */
export async function getEnrollmentCatalogCourses(): Promise<EnrollmentCatalogCourse[]> {
  const supabase = await createClient();
  const today = formatDate(new Date());

  const { data: courseRows, error: courseError } = await supabase
    .from("courses")
    .select(ENROLLMENT_CATALOG_COURSE_SELECT)
    .is("deleted_at", null)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (courseError) {
    throw new Error(courseError.message);
  }

  const courses = (courseRows ?? []) as CourseRow[];

  if (courses.length === 0) {
    return [];
  }

  const courseIds = courses.map((course) => course.id);

  const { data: classRows, error: classError } = await supabase
    .from("classes")
    .select(ENROLLMENT_CATALOG_CLASS_SELECT)
    .in("course_id", courseIds)
    .is("deleted_at", null)
    .order("enrollment_start", { ascending: true });

  if (classError) {
    throw new Error(classError.message);
  }

  const { data: categoryRows, error: categoryError } = await supabase
    .from("course_categories")
    .select(ENROLLMENT_CATALOG_CATEGORY_SELECT);

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  const categoryNameById = new Map(
    ((categoryRows ?? []) as CategoryRow[]).map((category) => [category.id, category.name]),
  );

  const openClassesByCourseId = groupOpenClassesByCourseId(
    (classRows ?? []) as ClassRow[],
    today,
  );

  return courses.map((course) =>
    mapToCatalogCourse(course, openClassesByCourseId.get(course.id) ?? [], categoryNameById),
  );
}

/**
 * 수강신청 화면 왼쪽 카테고리 목록입니다. 백오피스 카테고리관리(course_categories)에서
 * is_active=true인 카테고리를 sort_order 순으로 가져오고, "전체과정"을 항상 맨 위에 둡니다.
 */
export async function getActiveEnrollmentCategories(): Promise<EnrollmentCatalogCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_categories")
    .select(ENROLLMENT_CATALOG_CATEGORY_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const categories = (data ?? []) as CategoryRow[];

  return [
    { id: ENROLLMENT_CATALOG_ALL_CATEGORY_ID, label: "전체과정" },
    ...categories.map((category) => ({ id: category.id, label: category.name })),
  ];
}

function groupOpenClassesByCourseId(rows: ClassRow[], today: string) {
  const map = new Map<string, EnrollmentCatalogClass[]>();

  for (const row of rows) {
    if (!isApplicationOpen(row, today)) {
      continue;
    }

    const list = map.get(row.course_id) ?? [];
    list.push({
      id: row.id,
      year: row.year,
      name: row.name,
      managerName: row.manager_name,
      applicationStart: row.application_start,
      applicationEnd: row.application_end,
      enrollmentStart: row.enrollment_start,
      enrollmentEnd: row.enrollment_end,
    });
    map.set(row.course_id, list);
  }

  for (const list of map.values()) {
    list.sort((a, b) => (a.applicationEnd ?? "9999-12-31").localeCompare(b.applicationEnd ?? "9999-12-31"));
  }

  return map;
}

export function isApplicationOpen(
  row: { application_start: string | null; application_end: string | null },
  today: string,
) {
  if (row.application_start && row.application_start > today) {
    return false;
  }

  if (row.application_end && row.application_end < today) {
    return false;
  }

  return true;
}

function mapToCatalogCourse(
  course: CourseRow,
  openClasses: EnrollmentCatalogClass[],
  categoryNameById: Map<string, string>,
): EnrollmentCatalogCourse {
  const nearestClass = openClasses[0] ?? null;
  const categoryId = course.category_id ?? "uncategorized";
  const categoryLabel = course.category_id
    ? (categoryNameById.get(course.category_id) ?? ENROLLMENT_CATALOG_UNCATEGORIZED_LABEL)
    : ENROLLMENT_CATALOG_UNCATEGORIZED_LABEL;

  return {
    id: course.id,
    slug: course.code,
    title: course.name,
    suffix: nearestClass ? `(${nearestClass.year}년 ${nearestClass.name})` : "",
    badge: deriveBadge(course),
    categoryId,
    categoryLabel,
    professorName: course.professor_name?.trim() || null,
    durationLabel: course.default_duration_days
      ? `총 ${course.default_duration_days}일 과정`
      : "안내 예정",
    studyMethod: course.study_method?.trim() || "안내 예정",
    lectureTime: course.lecture_time?.trim() || "안내 예정",
    supervisingAgency: course.supervising_agency?.trim() || "안내 예정",
    price: course.price,
    regularPrice: course.regular_price,
    displayPrice: course.display_price,
    isFreeCourse: course.is_free_course,
    thumbnailUrl: course.thumbnail_url,
    classes: openClasses,
  };
}

/** 과정관리 > 과정등록/수정의 "마감임박 표시" 스위치(courses.is_deadline_soon)를 그대로 반영합니다. */
function deriveBadge(course: CourseRow): EnrollmentCatalogBadge | null {
  return course.is_deadline_soon ? { label: "마감임박", tone: "urgent" } : null;
}

export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
