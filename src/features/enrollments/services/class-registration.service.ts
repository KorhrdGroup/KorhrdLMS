import { COURSE_OPTION_SELECT } from "@/features/enrollments/constants";
import type {
  ClassRegistrationInput,
  ClassRegistrationOptions,
  ClassRegistrationResult,
} from "@/features/enrollments/types/class-registration.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseYear(value: string): number | null {
  const year = Number.parseInt(normalize(value), 10);
  if (Number.isNaN(year) || year < 1900 || year > 9999) {
    return null;
  }
  return year;
}

function validateDateField(
  value: string,
  field: keyof ClassRegistrationInput,
  label: string,
): ClassRegistrationResult | null {
  if (!normalize(value)) {
    return {
      success: false,
      message: `${label}을(를) 입력해주세요.`,
      field,
    };
  }

  if (Number.isNaN(Date.parse(value))) {
    return {
      success: false,
      message: `올바른 ${label}을(를) 입력해주세요.`,
      field,
    };
  }

  return null;
}

export function validateClassRegistrationInput(
  input: ClassRegistrationInput,
): ClassRegistrationResult {
  if (!normalize(input.courseId)) {
    return {
      success: false,
      message: "과정을 선택해주세요.",
      field: "courseId",
    };
  }

  const year = parseYear(input.year);
  if (year == null) {
    return {
      success: false,
      message: "연도를 입력해주세요.",
      field: "year",
    };
  }

  if (!normalize(input.batchName)) {
    return {
      success: false,
      message: "반명을 입력해주세요.",
      field: "batchName",
    };
  }

  const enrollmentStartError = validateDateField(
    input.enrollmentStart,
    "enrollmentStart",
    "수강 시작일",
  );
  if (enrollmentStartError) {
    return enrollmentStartError;
  }

  const enrollmentEndError = validateDateField(
    input.enrollmentEnd,
    "enrollmentEnd",
    "수강 종료일",
  );
  if (enrollmentEndError) {
    return enrollmentEndError;
  }

  if (input.enrollmentEnd < input.enrollmentStart) {
    return {
      success: false,
      message: "수강 종료일은 시작일 이후여야 합니다.",
      field: "enrollmentEnd",
    };
  }

  const hasApplicationStart = !!normalize(input.applicationStart);
  const hasApplicationEnd = !!normalize(input.applicationEnd);

  if (hasApplicationStart || hasApplicationEnd) {
    const applicationStartError = validateDateField(
      input.applicationStart,
      "applicationStart",
      "신청 시작일",
    );
    if (applicationStartError) {
      return applicationStartError;
    }

    const applicationEndError = validateDateField(
      input.applicationEnd,
      "applicationEnd",
      "신청 종료일",
    );
    if (applicationEndError) {
      return applicationEndError;
    }

    if (input.applicationEnd < input.applicationStart) {
      return {
        success: false,
        message: "신청 종료일은 시작일 이후여야 합니다.",
        field: "applicationEnd",
      };
    }
  }

  return {
    success: true,
    classId: "",
    message: "",
  };
}

export async function getClassRegistrationOptions(): Promise<ClassRegistrationOptions> {
  const supabase = await createClient();

  const coursesResult = await supabase
    .from("courses")
    .select(COURSE_OPTION_SELECT)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  return {
    courses: (coursesResult.data ?? []).map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
    })),
  };
}

export async function createClassRegistration(
  input: ClassRegistrationInput,
): Promise<ClassRegistrationResult> {
  const validation = validateClassRegistrationInput(input);
  if (!validation.success) {
    return validation;
  }

  const year = parseYear(input.year)!;
  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", input.courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!course) {
    return {
      success: false,
      message: "등록된 과정이 없습니다. 과정관리에서 과정을 먼저 등록해주세요.",
      field: "courseId",
    };
  }

  const insertData: Database["public"]["Tables"]["classes"]["Insert"] = {
    course_id: input.courseId,
    year,
    name: normalize(input.batchName),
    manager_name: emptyToNull(input.managerName),
    application_start: emptyToNull(input.applicationStart),
    application_end: emptyToNull(input.applicationEnd),
    enrollment_start: input.enrollmentStart,
    enrollment_end: input.enrollmentEnd,
  };

  const { data, error } = await supabase
    .from("classes")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    classId: data.id,
    message: "수강반이 등록되었습니다.",
  };
}
