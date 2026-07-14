import { hashPassword } from "@/lib/shared/password";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type {
  LoginIdCheckResult,
  MemberRegistrationInput,
  MemberRegistrationResult,
} from "../types/member-registration.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateMemberRegistrationInput(
  input: MemberRegistrationInput,
  loginIdVerified: boolean,
): MemberRegistrationResult {
  if (!normalize(input.name)) {
    return { success: false, message: "이름을 입력해주세요.", field: "name" };
  }

  if (!normalize(input.loginId)) {
    return { success: false, message: "아이디를 입력해주세요.", field: "loginId" };
  }

  if (!/^[a-zA-Z0-9_]{4,20}$/.test(normalize(input.loginId))) {
    return {
      success: false,
      message: "아이디는 4~20자의 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.",
      field: "loginId",
    };
  }

  if (!loginIdVerified) {
    return {
      success: false,
      message: "아이디 중복확인을 완료해주세요.",
      field: "loginId",
    };
  }

  if (!input.password) {
    return {
      success: false,
      message: "비밀번호를 입력해주세요.",
      field: "password",
    };
  }

  if (input.password.length < 8) {
    return {
      success: false,
      message: "비밀번호는 8자 이상 입력해주세요.",
      field: "password",
    };
  }

  if (input.password !== input.passwordConfirm) {
    return {
      success: false,
      message: "비밀번호 확인이 일치하지 않습니다.",
      field: "passwordConfirm",
    };
  }

  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalize(input.email))) {
    return {
      success: false,
      message: "올바른 이메일 형식을 입력해주세요.",
      field: "email",
    };
  }

  if (input.birthDate && Number.isNaN(Date.parse(input.birthDate))) {
    return {
      success: false,
      message: "올바른 생년월일을 입력해주세요.",
      field: "birthDate",
    };
  }

  return { success: true, memberId: "" };
}

export async function checkLoginIdAvailability(
  loginId: string,
): Promise<LoginIdCheckResult> {
  const normalized = normalize(loginId);

  if (!normalized) {
    return { available: false, message: "아이디를 입력해주세요." };
  }

  if (!/^[a-zA-Z0-9_]{4,20}$/.test(normalized)) {
    return {
      available: false,
      message: "아이디는 4~20자의 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("login_id", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return { available: false, message: "이미 사용 중인 아이디입니다." };
  }

  return { available: true, message: "사용 가능한 아이디입니다." };
}

export async function createMember(
  input: MemberRegistrationInput,
  loginIdVerified: boolean,
): Promise<MemberRegistrationResult> {
  const validation = validateMemberRegistrationInput(input, loginIdVerified);
  if (!validation.success) {
    return validation;
  }

  const loginId = normalize(input.loginId);
  const availability = await checkLoginIdAvailability(loginId);
  if (!availability.available) {
    return {
      success: false,
      message: availability.message,
      field: "loginId",
    };
  }

  const insertData: Database["public"]["Tables"]["members"]["Insert"] = {
    login_id: loginId,
    name: normalize(input.name),
    password_hash: hashPassword(input.password),
    resident_registration_number: emptyToNull(input.residentRegistrationNumber),
    birth_date: emptyToNull(input.birthDate),
    calendar_type: input.calendarType,
    email: emptyToNull(input.email),
    tel: emptyToNull(input.tel),
    phone: emptyToNull(input.phone),
    postal_code: emptyToNull(input.postalCode),
    address: emptyToNull(input.address),
    address_detail: emptyToNull(input.addressDetail),
    graduated_school: emptyToNull(input.graduatedSchool),
    school_name: emptyToNull(input.schoolName),
    major_name: emptyToNull(input.majorName),
    desired_degree: emptyToNull(input.desiredDegree),
    desired_major_name: emptyToNull(input.desiredMajorName),
    join_path: emptyToNull(input.joinPath),
    occupation: emptyToNull(input.occupation),
    degree_purpose: emptyToNull(input.degreePurpose),
    referrer_login_id: emptyToNull(input.referrerLoginId),
    status: "active",
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: "이미 사용 중인 아이디입니다.",
        field: "loginId",
      };
    }

    throw new Error(error.message);
  }

  return { success: true, memberId: data.id };
}
