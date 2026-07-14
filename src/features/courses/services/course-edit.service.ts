import {
  COURSE_DISPLAY_PRICE_DEFAULT,
  COURSE_LECTURE_TIME_DEFAULT,
  COURSE_REGULAR_PRICE_DEFAULT,
  COURSE_STUDY_METHOD_DEFAULT,
  COURSE_SUPERVISING_AGENCY_DEFAULT,
} from "@/features/courses/constants";
import { COURSE_EDIT_SELECT } from "@/features/courses/types/course-edit.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type {
  CourseEditDetail,
  CourseEditInput,
  CourseEditResult,
  GetCourseForEditResult,
} from "../types/course-edit.types";

function normalize(value: string) {
  return value.trim();
}

/**
 * Supabase 마이그레이션 적용 직후 PostgREST 스키마 캐시가 아직 갱신되지 않았을 때
 * "Could not find the 'thumbnail_url' column ... in the schema cache"(PGRST204) 오류가
 * 발생할 수 있습니다. 이 경우 과정수정 자체가 실패하지 않도록 썸네일 없이 재시도합니다.
 */
function isMissingThumbnailColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST204" &&
    typeof error.message === "string" &&
    error.message.includes("thumbnail_url")
  );
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function emptyToDefault(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function formatNumberForInput(value: number | null) {
  if (value == null) {
    return "";
  }

  return String(value);
}

function parseOptionalPositiveInt(value: string, fieldLabel: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true as const, value: null };
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return {
      ok: false as const,
      message: `${fieldLabel}은(는) 1 이상의 정수로 입력해주세요.`,
    };
  }

  return { ok: true as const, value: parsed };
}

function parseOptionalPercent(value: string, fieldLabel: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true as const, value: null };
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    return {
      ok: false as const,
      message: `${fieldLabel}은(는) 0~100 사이 숫자로 입력해주세요.`,
    };
  }

  return { ok: true as const, value: parsed };
}

function parsePrice(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true as const, value: 0 };
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return {
      ok: false as const,
      message: "수강료는 0 이상의 정수로 입력해주세요.",
    };
  }

  return { ok: true as const, value: parsed };
}

function parsePriceWithDefault(value: string, fallback: number, fieldLabel: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true as const, value: fallback };
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return {
      ok: false as const,
      message: `${fieldLabel}은(는) 0 이상의 정수로 입력해주세요.`,
    };
  }

  return { ok: true as const, value: parsed };
}

function mapRowToEditDetail(row: {
  id: string;
  code: string;
  name: string;
  category: string | null;
  category_id: string | null;
  default_duration_days: number | null;
  completion_attendance_rate: number | null;
  completion_exam_score: number | null;
  price: number;
  status: CourseEditDetail["status"];
  description: string | null;
  professor_name: string | null;
  study_method: string | null;
  lecture_time: string | null;
  supervising_agency: string | null;
  is_deadline_soon: boolean;
  regular_price: number;
  display_price: number;
  is_free_course: boolean;
  thumbnail_url: string | null;
}): CourseEditDetail {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    categoryId: row.category_id ?? "",
    defaultDurationDays: formatNumberForInput(row.default_duration_days),
    completionAttendanceRate: formatNumberForInput(row.completion_attendance_rate),
    completionExamScore: formatNumberForInput(row.completion_exam_score),
    price: row.price ? String(row.price) : "",
    status: row.status,
    description: row.description ?? "",
    professorName: row.professor_name ?? "",
    studyMethod: row.study_method ?? "",
    lectureTime: row.lecture_time ?? "",
    supervisingAgency: row.supervising_agency ?? "",
    isDeadlineSoon: row.is_deadline_soon,
    regularPrice: String(row.regular_price),
    displayPrice: String(row.display_price),
    isFreeCourse: row.is_free_course,
    thumbnailUrl: row.thumbnail_url ?? "",
  };
}

export function validateCourseEditInput(input: CourseEditInput): CourseEditResult {
  if (!normalize(input.name)) {
    return { success: false, message: "과정명을 입력해주세요.", field: "name" };
  }

  const code = normalize(input.code);
  if (!code) {
    return {
      success: false,
      message: "과정코드를 입력해주세요.",
      field: "code",
    };
  }

  if (!/^[a-zA-Z0-9_-]{2,30}$/.test(code)) {
    return {
      success: false,
      message: "과정코드는 2~30자의 영문, 숫자, -, _ 만 사용할 수 있습니다.",
      field: "code",
    };
  }

  const duration = parseOptionalPositiveInt(input.defaultDurationDays, "수강기간");
  if (!duration.ok) {
    return {
      success: false,
      message: duration.message,
      field: "defaultDurationDays",
    };
  }

  const attendance = parseOptionalPercent(
    input.completionAttendanceRate,
    "수료기준 출석률",
  );
  if (!attendance.ok) {
    return {
      success: false,
      message: attendance.message,
      field: "completionAttendanceRate",
    };
  }

  const examScore = parseOptionalPercent(
    input.completionExamScore,
    "수료기준 시험점수",
  );
  if (!examScore.ok) {
    return {
      success: false,
      message: examScore.message,
      field: "completionExamScore",
    };
  }

  const price = parsePrice(input.price);
  if (!price.ok) {
    return { success: false, message: price.message, field: "price" };
  }

  const regularPrice = parsePriceWithDefault(
    input.regularPrice,
    COURSE_REGULAR_PRICE_DEFAULT,
    "정가",
  );
  if (!regularPrice.ok) {
    return { success: false, message: regularPrice.message, field: "regularPrice" };
  }

  const displayPrice = parsePriceWithDefault(
    input.displayPrice,
    COURSE_DISPLAY_PRICE_DEFAULT,
    "표시가",
  );
  if (!displayPrice.ok) {
    return { success: false, message: displayPrice.message, field: "displayPrice" };
  }

  return { success: true, message: "" };
}

async function isCourseNameTaken(name: string, excludeCourseId: string) {
  const normalized = normalize(name);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .ilike("name", normalized)
    .neq("id", excludeCourseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}

async function isCourseCodeTaken(code: string, excludeCourseId: string) {
  const normalized = normalize(code);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .eq("code", normalized)
    .neq("id", excludeCourseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}

export async function getCourseForEdit(
  courseId: string,
): Promise<GetCourseForEditResult> {
  if (!courseId.trim()) {
    return { success: false, message: "과정 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_EDIT_SELECT)
    .eq("id", courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "과정 정보를 찾을 수 없습니다." };
  }

  return { success: true, course: mapRowToEditDetail(data) };
}

export async function updateCourse(
  courseId: string,
  input: CourseEditInput,
): Promise<CourseEditResult> {
  const validation = validateCourseEditInput(input);
  if (!validation.success) {
    return validation;
  }

  if (await isCourseNameTaken(input.name, courseId)) {
    return {
      success: false,
      message: "이미 사용 중인 과정명입니다.",
      field: "name",
    };
  }

  if (await isCourseCodeTaken(input.code, courseId)) {
    return {
      success: false,
      message: "이미 사용 중인 과정코드입니다.",
      field: "code",
    };
  }

  const duration = parseOptionalPositiveInt(input.defaultDurationDays, "수강기간");
  const attendance = parseOptionalPercent(
    input.completionAttendanceRate,
    "수료기준 출석률",
  );
  const examScore = parseOptionalPercent(
    input.completionExamScore,
    "수료기준 시험점수",
  );
  const price = parsePrice(input.price);
  const regularPrice = parsePriceWithDefault(
    input.regularPrice,
    COURSE_REGULAR_PRICE_DEFAULT,
    "정가",
  );
  const displayPrice = parsePriceWithDefault(
    input.displayPrice,
    COURSE_DISPLAY_PRICE_DEFAULT,
    "표시가",
  );

  if (
    !duration.ok ||
    !attendance.ok ||
    !examScore.ok ||
    !price.ok ||
    !regularPrice.ok ||
    !displayPrice.ok
  ) {
    return { success: false, message: "입력값을 확인해주세요." };
  }

  const updateData: Database["public"]["Tables"]["courses"]["Update"] = {
    name: normalize(input.name),
    code: normalize(input.code),
    category_id: emptyToNull(input.categoryId),
    default_duration_days: duration.value,
    completion_attendance_rate: attendance.value,
    completion_exam_score: examScore.value,
    price: price.value,
    status: input.status,
    description: emptyToNull(input.description),
    professor_name: emptyToNull(input.professorName),
    study_method: emptyToDefault(input.studyMethod, COURSE_STUDY_METHOD_DEFAULT),
    lecture_time: emptyToDefault(input.lectureTime, COURSE_LECTURE_TIME_DEFAULT),
    supervising_agency: emptyToDefault(input.supervisingAgency, COURSE_SUPERVISING_AGENCY_DEFAULT),
    is_deadline_soon: input.isDeadlineSoon,
    regular_price: regularPrice.value,
    display_price: displayPrice.value,
    is_free_course: input.isFreeCourse,
    thumbnail_url: emptyToNull(input.thumbnailUrl),
  };

  const supabase = await createClient();
  let { data, error } = await supabase
    .from("courses")
    .update(updateData)
    .eq("id", courseId)
    .is("deleted_at", null)
    .select("name")
    .maybeSingle();

  let thumbnailSaveFailed = false;

  if (error && isMissingThumbnailColumnError(error) && updateData.thumbnail_url) {
    thumbnailSaveFailed = true;
    const fallbackUpdateData = { ...updateData };
    delete fallbackUpdateData.thumbnail_url;
    ({ data, error } = await supabase
      .from("courses")
      .update(fallbackUpdateData)
      .eq("id", courseId)
      .is("deleted_at", null)
      .select("name")
      .maybeSingle());
  }

  if (error) {
    if (error.code === "23505") {
      if (await isCourseNameTaken(input.name, courseId)) {
        return {
          success: false,
          message: "이미 사용 중인 과정명입니다.",
          field: "name",
        };
      }

      return {
        success: false,
        message: "이미 사용 중인 과정코드입니다.",
        field: "code",
      };
    }

    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "과정 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    message: thumbnailSaveFailed
      ? `"${data.name}" 과정이 수정되었습니다. (썸네일 이미지는 저장하지 못했습니다. 잠시 후 다시 시도해주세요.)`
      : `"${data.name}" 과정이 수정되었습니다.`,
  };
}
