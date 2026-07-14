import { MEMBER_EDIT_SELECT } from "@/features/members/types/member-edit.types";
import { createClient } from "@/lib/supabase/server";
import type { Database, MemberStatus } from "@/types/database.types";

import type {
  GetMemberForEditResult,
  MemberEditDetail,
  MemberEditInput,
  MemberEditResult,
} from "../types/member-edit.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatBirthDateForInput(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function mapRowToEditDetail(row: {
  id: string;
  login_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: MemberStatus;
  manager_name: string | null;
  postal_code: string | null;
  address: string | null;
  address_detail: string | null;
  birth_date: string | null;
  memo: string | null;
}): MemberEditDetail {
  return {
    id: row.id,
    loginId: row.login_id,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    status: row.status,
    managerName: row.manager_name ?? "",
    postalCode: row.postal_code ?? "",
    address: row.address ?? "",
    addressDetail: row.address_detail ?? "",
    birthDate: formatBirthDateForInput(row.birth_date),
    memo: row.memo ?? "",
  };
}

export function validateMemberEditInput(input: MemberEditInput): MemberEditResult {
  if (!normalize(input.name)) {
    return { success: false, message: "이름을 입력해주세요.", field: "name" };
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

  return { success: true };
}

export async function getMemberForEdit(
  memberId: string,
): Promise<GetMemberForEditResult> {
  if (!memberId.trim()) {
    return { success: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_EDIT_SELECT)
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  return { success: true, member: mapRowToEditDetail(data) };
}

/**
 * 회원목록의 "회원정보이력" 컬럼에서 메모만 빠르게 저장할 때 사용합니다.
 * 회원수정 모달의 전체 저장(updateMember)과 달리 다른 필드 검증 없이
 * memo 컬럼만 갱신합니다.
 */
export async function updateMemberMemo(
  memberId: string,
  memo: string,
): Promise<MemberEditResult> {
  if (!memberId.trim()) {
    return { success: false, message: "회원 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .update({ memo: emptyToNull(memo) })
    .eq("id", memberId)
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

export async function updateMember(
  memberId: string,
  input: MemberEditInput,
): Promise<MemberEditResult> {
  const validation = validateMemberEditInput(input);
  if (!validation.success) {
    return validation;
  }

  const updateData: Database["public"]["Tables"]["members"]["Update"] = {
    name: normalize(input.name),
    phone: emptyToNull(input.phone),
    email: emptyToNull(input.email),
    status: input.status,
    manager_name: emptyToNull(input.managerName),
    postal_code: emptyToNull(input.postalCode),
    address: emptyToNull(input.address),
    address_detail: emptyToNull(input.addressDetail),
    birth_date: emptyToNull(input.birthDate),
    memo: emptyToNull(input.memo),
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .update(updateData)
    .eq("id", memberId)
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
