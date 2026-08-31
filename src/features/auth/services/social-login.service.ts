import { cookies } from "next/headers";

import { tryRestoreLegacyRecords } from "@/features/members/services/legacy-restore.service";
import { REFERRAL_COOKIE } from "@/lib/shared/referral-source";
import { STUDENT_SESSION_COOKIE } from "@/lib/student/session";
import { createClient } from "@/lib/supabase/server";

/**
 * 소셜 로그인(네이버·카카오) 공통 처리.
 *
 * 학생 세션은 Supabase Auth가 아니라 `members` + httpOnly 쿠키라, 소셜도 직접
 * 붙입니다. 소셜에서 받은 정보로 회원을 찾거나 만들고 같은 쿠키를 심습니다.
 *
 * 잇는 순서 (마이그레이션 20260807000002 주석과 짝)
 *   1) 소셜 고유번호(naver_id/kakao_id)로 이미 연동된 회원
 *   2) 휴대폰 번호가 같은 기존 회원 — 찾으면 그 회원에 소셜을 연결
 *   3) 없으면 새 회원을 만들고 연결
 *
 * 소셜로 만든 회원은 login_id·password_hash 가 비어 있습니다. 일반 로그인도
 * 하고 싶으면 마이페이지에서 나중에 정하면 됩니다.
 */
export type SocialProvider = "naver" | "kakao";

export type SocialProfile = {
  /** 소셜 계정 고유번호 */
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
};

export type SocialLoginResult =
  | { success: true; memberId: string; isNew: boolean }
  | { success: false; message: string };

const digits = (value: string) => value.replace(/\D/g, "");

/** 컴퓨티드 키로 넣으면 생성 타입이 무너져(index signature) 명시적으로 나눕니다 */
function socialIdField(provider: SocialProvider, socialId: string) {
  return provider === "naver" ? { naver_id: socialId } : { kakao_id: socialId };
}

/** 네이버는 "010-1234-5678", 카카오는 "+82 10-1234-5678" 로 줍니다 */
function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = digits(raw);
  if (d.startsWith("82")) d = `0${d.slice(2)}`;
  return /^01[016789]\d{7,8}$/.test(d) ? d : null;
}

export async function loginWithSocial(
  provider: SocialProvider,
  profile: SocialProfile,
): Promise<SocialLoginResult> {
  if (!profile.id) {
    return { success: false, message: "소셜 계정 정보를 받지 못했습니다." };
  }

  const supabase = await createClient();
  const idColumn = provider === "naver" ? "naver_id" : "kakao_id";
  const phone = normalizePhone(profile.phone);

  // 1) 이미 연동된 회원
  const { data: linked } = await supabase
    .from("members")
    .select("id, status")
    .eq(idColumn, profile.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (linked) {
    if ((linked as { status: string }).status !== "active") {
      return { success: false, message: "이용할 수 없는 계정입니다. 고객센터로 문의해주세요." };
    }
    await touchLogin(supabase, (linked as { id: string }).id);
    return { success: true, memberId: (linked as { id: string }).id, isNew: false };
  }

  // 2) 휴대폰 번호가 같은 기존 회원에 연결
  if (phone) {
    const { data: rows } = await supabase
      .from("members")
      .select("id, phone, status")
      .is("deleted_at", null);

    const matched = (rows ?? []).find(
      (row) => digits((row as { phone: string | null }).phone ?? "") === phone,
    ) as { id: string; status: string } | undefined;

    if (matched) {
      if (matched.status !== "active") {
        return { success: false, message: "이용할 수 없는 계정입니다. 고객센터로 문의해주세요." };
      }
      await supabase
        .from("members")
        .update({
          ...socialIdField(provider, profile.id),
          last_login_at: new Date().toISOString(),
        })
        .eq("id", matched.id);
      return { success: true, memberId: matched.id, isNew: false };
    }
  }

  // 3) 새 회원
  const loginId = await makeSocialLoginId(supabase, provider, profile.id);

  const { data: created, error } = await supabase
    .from("members")
    .insert({
      login_id: loginId,
      name: (profile.name ?? "").trim() || "회원",
      phone: phone ?? "",
      email: profile.email ?? null,
      birth_date: profile.birthDate ?? null,
      status: "active",
      join_path: provider === "naver" ? "네이버 로그인" : "카카오 로그인",
      // 마케팅 링크 첫 방문 때 ReferralTracker 가 남긴 유입경로 (없으면 null)
      referral_source: await readReferralSourceCookie(),
      ...socialIdField(provider, profile.id),
      last_login_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !created) {
    return { success: false, message: "회원 정보를 만들지 못했습니다. 잠시 후 다시 시도해주세요." };
  }

  // 옛 시스템 수강자라면 이관된 신청·수강 이력을 자동으로 붙입니다 (실패해도 가입 계속)
  await tryRestoreLegacyRecords((created as { id: string }).id);

  // 회원가입 알림톡 — 일반 회원가입(member-registration.service)과 동일하게 보냅니다.
  // 소셜 가입만 빠져 있어 수동 발송하던 문제를 고침 (2026-08-31). 실패해도 가입은 성공 처리.
  const createdId = (created as { id: string }).id;
  const memberName = (profile.name ?? "").trim() || "회원";
  if (phone) {
    const { sendAlimtalk } = await import("@/lib/aligo/alimtalk");
    await sendAlimtalk({
      receivers: phone,
      template: "SIGNUP",
      vars: { 고객명: memberName },
      log: { trigger: "auto_signup", memberId: createdId, receiverName: memberName },
    }).catch((e) => console.error("[소셜 가입] 알림톡 발송 오류", e));
  }

  return { success: true, memberId: createdId, isNew: true };
}

/**
 * 소셜 가입용 아이디를 만듭니다.
 *
 * `members.login_id` 는 필수·고유 컬럼이라 비워 둘 수 없습니다. 소셜 회원은
 * 아이디로 로그인하지 않으므로 `naver_a1b2c3d4` 처럼 기계적으로 만들고,
 * 나중에 마이페이지에서 본인이 정한 아이디로 바꿀 수 있게 둡니다.
 */
async function makeSocialLoginId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  provider: SocialProvider,
  socialId: string,
): Promise<string> {
  const seed = socialId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 12) || "user";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? `${provider}_${seed}` : `${provider}_${seed}${attempt}`;
    const { data } = await supabase
      .from("members")
      .select("id")
      .eq("login_id", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }

  return `${provider}_${Date.now().toString(36)}`;
}

async function touchLogin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  memberId: string,
) {
  await supabase
    .from("members")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", memberId);
}

/** 일반 로그인과 같은 쿠키·기간(24시간)을 씁니다 */
export async function setStudentSession(memberId: string) {
  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, memberId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

/** 마케팅 유입경로 쿠키(hp_ref)를 읽습니다. 없거나 못 읽으면 null. */
async function readReferralSourceCookie(): Promise<string | null> {
  try {
    const value = (await cookies()).get(REFERRAL_COOKIE)?.value;
    if (!value) return null;
    return decodeURIComponent(value).slice(0, 120) || null;
  } catch {
    return null;
  }
}
