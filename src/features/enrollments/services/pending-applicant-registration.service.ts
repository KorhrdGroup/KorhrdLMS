import {
  COURSE_OPTION_SELECT,
  MEMBER_REGISTRATION_OPTION_SELECT,
} from "@/features/enrollments/constants";
import type {
  PendingApplicantRegistrationInput,
  PendingApplicantRegistrationOptions,
  PendingApplicantRegistrationResult,
} from "@/features/enrollments/types/pending-applicant-registration.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validatePendingApplicantRegistrationInput(
  input: PendingApplicantRegistrationInput,
): PendingApplicantRegistrationResult {
  if (!normalize(input.memberId)) {
    return {
      success: false,
      message: "회원을 선택해주세요.",
      field: "memberId",
    };
  }

  if (!normalize(input.courseId)) {
    return {
      success: false,
      message: "과정을 선택해주세요.",
      field: "courseId",
    };
  }

  if (!normalize(input.startDate)) {
    return {
      success: false,
      message: "수강 시작일을 입력해주세요.",
      field: "startDate",
    };
  }

  if (!normalize(input.endDate)) {
    return {
      success: false,
      message: "수강 종료일을 입력해주세요.",
      field: "endDate",
    };
  }

  if (Number.isNaN(Date.parse(input.startDate))) {
    return {
      success: false,
      message: "올바른 수강 시작일을 입력해주세요.",
      field: "startDate",
    };
  }

  if (Number.isNaN(Date.parse(input.endDate))) {
    return {
      success: false,
      message: "올바른 수강 종료일을 입력해주세요.",
      field: "endDate",
    };
  }

  if (input.endDate < input.startDate) {
    return {
      success: false,
      message: "수강 종료일은 시작일 이후여야 합니다.",
      field: "endDate",
    };
  }

  return {
    success: true,
    enrollmentId: "",
    message: "",
  };
}

export async function getPendingApplicantRegistrationOptions(): Promise<PendingApplicantRegistrationOptions> {
  const supabase = await createClient();

  const [membersResult, coursesResult] = await Promise.all([
    supabase
      .from("members")
      .select(MEMBER_REGISTRATION_OPTION_SELECT)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("courses")
      .select(COURSE_OPTION_SELECT)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  return {
    members: (membersResult.data ?? []).map((member) => ({
      id: member.id,
      name: member.name,
      loginId: member.login_id,
      managerName: member.manager_name ?? "",
    })),
    courses: (coursesResult.data ?? []).map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
    })),
  };
}

export async function createPendingApplicantRegistration(
  input: PendingApplicantRegistrationInput,
): Promise<PendingApplicantRegistrationResult> {
  const validation = validatePendingApplicantRegistrationInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("id", input.memberId)
    .is("deleted_at", null)
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    return {
      success: false,
      message: "선택한 회원을 찾을 수 없습니다.",
      field: "memberId",
    };
  }

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

  const today = new Date().toISOString().slice(0, 10);
  const insertData: Database["public"]["Tables"]["enrollments"]["Insert"] = {
    member_id: input.memberId,
    course_id: input.courseId,
    batch: emptyToNull(input.batch),
    start_date: input.startDate,
    end_date: input.endDate,
    status: "pending",
    payment_status: input.paymentStatus,
    manager_name: emptyToNull(input.managerName),
    memo: emptyToNull(input.memo),
    year: new Date(input.startDate).getFullYear(),
    application_date: today,
  };

  const { data, error } = await supabase
    .from("enrollments")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: "해당 회원은 이미 이 과정에 신청되어 있습니다.",
        field: "courseId",
      };
    }

    throw new Error(error.message);
  }

  return {
    success: true,
    enrollmentId: data.id,
    message: "신청 수강생이 등록되었습니다.",
  };
}
