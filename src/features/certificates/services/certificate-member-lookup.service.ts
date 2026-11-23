import { getCurrentAdminLoginId, isBabyAdmin } from "@/lib/admin/current-admin";
import { createClient } from "@/lib/supabase/server";

/**
 * 발급신청 "추가" 창 자동 채우기 — 아이디를 넣으면 그 회원의 이름 · 생년월일 · 연락처 · 주소 (2026-11-23 사용자).
 * 회원 정보에 비어 있는 칸은 그 회원의 가장 최근 발급신청에 적힌 값으로 채웁니다(배송 주소는 보통 신청 때 적음).
 * 창은 빈 칸만 채우고, 이미 적은 칸은 덮지 않습니다.
 */
export type CertificateMemberLookup = {
  name: string;
  birthDate: string;
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
};

export type CertificateMemberLookupResult =
  | { found: true; member: CertificateMemberLookup }
  | { found: false; message: string };

const pick = (...values: (string | null | undefined)[]) => values.map((v) => (v ?? "").trim()).find(Boolean) ?? "";
const isoDate = (value: string | null | undefined) => {
  const v = (value ?? "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
};

export async function lookupMemberForCertificate(loginIdInput: string): Promise<CertificateMemberLookupResult> {
  if (!(await getCurrentAdminLoginId()) || (await isBabyAdmin())) {
    return { found: false, message: "권한이 없습니다." };
  }
  const loginId = loginIdInput.trim();
  if (!loginId) return { found: false, message: "" };

  const supabase = await createClient();
  const { data: member, error } = await supabase
    .from("members")
    .select("id, name, birth_date, phone, tel, postal_code, address, address_detail")
    .eq("login_id", loginId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) return { found: false, message: "회원 정보를 읽지 못했습니다." };
  if (!member) return { found: false, message: `아이디 "${loginId}" 회원이 없습니다.` };

  // 회원 정보에 없는 칸은 최근 발급신청 값으로
  const { data: lastApp } = await supabase
    .from("certificate_applications")
    .select("applicant_name, birth_date, phone, postal_code, address, address_detail")
    .eq("member_id", member.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 주소는 우편번호 · 주소 · 상세주소를 한 묶음으로 — 회원 주소가 있으면 회원 것, 없으면 최근 신청 것 (섞이면 어긋난다)
  const fromMember = pick(member.address) !== "";
  const addr = fromMember
    ? { postal: member.postal_code, address: member.address, detail: member.address_detail }
    : { postal: lastApp?.postal_code, address: lastApp?.address, detail: lastApp?.address_detail };

  return {
    found: true,
    member: {
      name: pick(member.name, lastApp?.applicant_name),
      birthDate: isoDate(member.birth_date) || isoDate(lastApp?.birth_date),
      phone: pick(member.phone, member.tel, lastApp?.phone),
      postalCode: pick(addr.postal),
      address: pick(addr.address),
      addressDetail: pick(addr.detail),
    },
  };
}
