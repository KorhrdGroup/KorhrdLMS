import {
  COURSE_DISPLAY_PRICE_DEFAULT,
  COURSE_LECTURE_TIME_DEFAULT,
  COURSE_REGULAR_PRICE_DEFAULT,
  COURSE_STUDY_METHOD_DEFAULT,
  COURSE_SUPERVISING_AGENCY_DEFAULT,
} from "@/features/courses/constants";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type {
  CourseNameCheckResult,
  CourseRegistrationInput,
  CourseRegistrationResult,
} from "../types/course.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function emptyToDefault(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
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

/**
 * Supabase 마이그레이션 적용 직후 PostgREST 스키마 캐시가 아직 갱신되지 않았을 때
 * "Could not find the 'thumbnail_url' column ... in the schema cache"(PGRST204) 오류가
 * 발생할 수 있습니다. 이 경우 과정등록 자체가 실패하지 않도록 썸네일 없이 재시도합니다.
 */
function isMissingThumbnailColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST204" &&
    typeof error.message === "string" &&
    error.message.includes("thumbnail_url")
  );
}

function generateCourseCode(name: string) {
  const prefix =
    normalize(name)
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 8)
      .toUpperCase() || "NEW";
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);

  return `CRS-${prefix}-${suffix}`;
}

function resolveCourseCode(input: CourseRegistrationInput): CourseRegistrationResult | string {
  const code = normalize(input.code);

  if (!code) {
    return generateCourseCode(input.name);
  }

  if (!/^[a-zA-Z0-9_-]{2,30}$/.test(code)) {
    return {
      success: false,
      message: "과정코드는 2~30자의 영문, 숫자, -, _ 만 사용할 수 있습니다.",
      field: "code",
    };
  }

  return code;
}

export async function checkCourseNameAvailability(
  name: string,
): Promise<CourseNameCheckResult> {
  const normalized = normalize(name);

  if (!normalized) {
    return { available: false, message: "과정명을 입력해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .ilike("name", normalized)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return { available: false, message: "이미 사용 중인 과정명입니다." };
  }

  return { available: true, message: "사용 가능한 과정명입니다." };
}

export function validateCourseRegistrationInput(
  input: CourseRegistrationInput,
  nameVerified: boolean,
): CourseRegistrationResult {
  if (!normalize(input.name)) {
    return { success: false, message: "과정명을 입력해주세요.", field: "name" };
  }

  if (!nameVerified) {
    return {
      success: false,
      message: "과정명 중복확인을 완료해주세요.",
      field: "name",
    };
  }

  const codeResult = resolveCourseCode(input);
  if (typeof codeResult !== "string") {
    return codeResult;
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

  return { success: true, courseId: "", message: "" };
}

export async function createCourse(
  input: CourseRegistrationInput,
  nameVerified: boolean,
): Promise<CourseRegistrationResult> {
  const validation = validateCourseRegistrationInput(input, nameVerified);
  if (!validation.success) {
    return validation;
  }

  const nameAvailability = await checkCourseNameAvailability(input.name);
  if (!nameAvailability.available) {
    return {
      success: false,
      message: nameAvailability.message,
      field: "name",
    };
  }

  const codeResult = resolveCourseCode(input);
  if (typeof codeResult !== "string") {
    return codeResult;
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

  const insertData: Database["public"]["Tables"]["courses"]["Insert"] = {
    name: normalize(input.name),
    code: codeResult,
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
    .insert(insertData)
    .select("id, name")
    .single();

  let thumbnailSaveFailed = false;

  if (error && isMissingThumbnailColumnError(error) && insertData.thumbnail_url) {
    thumbnailSaveFailed = true;
    const fallbackInsertData = { ...insertData };
    delete fallbackInsertData.thumbnail_url;
    ({ data, error } = await supabase
      .from("courses")
      .insert(fallbackInsertData)
      .select("id, name")
      .single());
  }

  if (error) {
    if (error.code === "23505") {
      const nameCheck = await checkCourseNameAvailability(input.name);
      if (!nameCheck.available) {
        return {
          success: false,
          message: nameCheck.message,
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
    throw new Error("과정 등록에 실패했습니다.");
  }

  return {
    success: true,
    courseId: data.id,
    message: thumbnailSaveFailed
      ? `"${data.name}" 과정이 등록되었습니다. (썸네일 이미지는 저장하지 못했습니다. 잠시 후 과정수정에서 다시 시도해주세요.)`
      : `"${data.name}" 과정이 등록되었습니다.`,
  };
}
