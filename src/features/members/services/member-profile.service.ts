import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * 학생이 본인 회원정보를 직접 고치는 화면(`/mypage`)용 서비스입니다.
 *
 * 관리자 회원수정(`member-edit.service.ts`)과 일부러 분리했습니다. 관리자용은
 * 상태(status)·담당자·메모까지 덮어쓰는데, 학생이 그 값을 건드릴 수 있으면 안 되기
 * 때문입니다. 여기서는 본인이 고칠 수 있는 항목만 갱신합니다.
 * 아이디·생년월일은 자격증 표기에 쓰여 화면에서도 읽기 전용입니다.
 */
export type MemberProfile = {
  loginId: string;
  name: string;
  phone: string;
  email: string;
  postalCode: string;
  address: string;
  addressDetail: string;
};

export type MemberProfileInput = Omit<MemberProfile, "loginId">;

export type MemberProfileUpdateResult =
  | { success: true }
  | { success: false; message: string; field?: keyof MemberProfileInput };

export async function getMyProfile(memberId: string): Promise<MemberProfile | null> {
  if (!memberId.trim()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("login_id, name, phone, email, postal_code, address, address_detail")
    .eq("id", memberId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as {
    login_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    postal_code: string | null;
    address: string | null;
    address_detail: string | null;
  };

  return {
    loginId: row.login_id,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    postalCode: row.postal_code ?? "",
    address: row.address ?? "",
    addressDetail: row.address_detail ?? "",
  };
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function validate(input: MemberProfileInput): MemberProfileUpdateResult {
  if (!input.name.trim()) {
    return { success: false, message: "이름을 입력해주세요.", field: "name" };
  }

  if (!input.phone.trim()) {
    return { success: false, message: "휴대폰 번호를 입력해주세요.", field: "phone" };
  }

  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return { success: false, message: "올바른 이메일 형식을 입력해주세요.", field: "email" };
  }

  // 자격증이 등록된 주소로 배송되므로 주소는 필수로 받습니다.
  if (!input.address.trim()) {
    return { success: false, message: "주소를 입력해주세요.", field: "address" };
  }

  return { success: true };
}

export async function updateMyProfile(
  memberId: string,
  input: MemberProfileInput,
): Promise<MemberProfileUpdateResult> {
  if (!memberId.trim()) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const validation = validate(input);
  if (!validation.success) {
    return validation;
  }

  const updateData: Database["public"]["Tables"]["members"]["Update"] = {
    name: input.name.trim(),
    phone: emptyToNull(input.phone),
    email: emptyToNull(input.email),
    postal_code: emptyToNull(input.postalCode),
    address: emptyToNull(input.address),
    address_detail: emptyToNull(input.addressDetail),
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .update(updateData)
    .eq("id", memberId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  return { success: true };
}
