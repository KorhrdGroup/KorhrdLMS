import { cookies } from "next/headers";

import { sendAlimtalk } from "@/lib/aligo/alimtalk";
import { hashPassword } from "@/lib/shared/password";
import { tryRestoreLegacyRecords } from "@/features/members/services/legacy-restore.service";
import { REFERRAL_COOKIE } from "@/lib/shared/referral-source";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/** 등록된 파트너스 코드 — 가입 시 이 코드만 인정합니다 (대문자 기준) */
const VALID_PARTNER_CODES = new Set(["STAR"]);

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

  // 학점은행제 연계 가입을 위해 단순 비밀번호(예: 1234)도 허용합니다.
  // 형식 제한 없이 길이(4~20자)만 검사합니다.
  if (input.password.length < 4 || input.password.length > 20) {
    return {
      success: false,
      message: "비밀번호는 4~20자로 입력해주세요.",
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

  // 파트너스 코드는 선택 입력 — 넣었다면 등록된 코드(STAR, 대소문자 무관)만 인정합니다
  if (normalize(input.partnerCode ?? "") && !VALID_PARTNER_CODES.has(normalize(input.partnerCode ?? "").toUpperCase())) {
    return {
      success: false,
      message: "유효하지 않은 파트너스 코드입니다.",
      field: "partnerCode",
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

  const supabase = await createClient();

  const phoneDigits = (input.phone ?? "").replace(/\D/g, "");
  if (phoneDigits) {
    const { data: rows } = await supabase
      .from("members")
      .select("id, phone, naver_id, kakao_id")
      .is("deleted_at", null);

    const dup = (rows ?? []).find(
      (r) => (r.phone ?? "").replace(/\D/g, "") === phoneDigits,
    );
    if (dup) {
      const isSocial = !!(dup.naver_id || dup.kakao_id);
      return {
        success: false,
        message: isSocial
          ? "이미 소셜 로그인으로 가입된 휴대폰 번호입니다. 소셜 로그인을 이용해주세요."
          : "이미 가입된 휴대폰 번호입니다. 아이디 찾기를 이용해주세요.",
        field: "phone",
      };
    }
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
    // 파트너스 코드 — 대문자로 정규화해 저장 (star → STAR)
    partner_code: normalize(input.partnerCode ?? "")
      ? normalize(input.partnerCode ?? "").toUpperCase()
      : null,
    // 마케팅 링크 첫 방문 때 ReferralTracker 가 남긴 유입경로 (없으면 null)
    referral_source: await readReferralCookie(),
    status: "active",
  };

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

  // 옛 시스템 수강자라면 이관된 신청·수강 이력을 자동으로 붙입니다 (실패해도 가입 계속)
  await tryRestoreLegacyRecords(data.id);

  // 회원가입 알림톡. 템플릿 검수 전이거나 발송에 실패해도 가입은 성공 처리합니다.
  if (insertData.phone) {
    await sendAlimtalk({
      receivers: insertData.phone,
      template: "SIGNUP",
      vars: { 고객명: insertData.name },
      log: { trigger: "auto_signup", memberId: data.id, receiverName: insertData.name },
    }).catch((e) => console.error("[회원가입] 알림톡 발송 오류", e));
  }

  return { success: true, memberId: data.id };
}

/** 마케팅 유입경로 쿠키(hp_ref)를 읽습니다. 없거나 못 읽으면 null. */
async function readReferralCookie(): Promise<string | null> {
  try {
    const value = (await cookies()).get(REFERRAL_COOKIE)?.value;
    if (!value) return null;
    return decodeURIComponent(value).slice(0, 120) || null;
  } catch {
    return null;
  }
}
