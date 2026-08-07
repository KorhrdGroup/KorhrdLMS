import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import { sendSms } from "@/lib/sens/sms";
import { createClient } from "@/lib/supabase/server";

/**
 * 휴대폰 문자 인증 — 아이디 찾기 / 비밀번호 재설정 본인확인.
 *
 * 저장 규칙은 마이그레이션(20260807000001) 주석과 짝입니다. 인증번호·토큰은
 * 원문을 남기지 않고 해시만 저장하므로, 여기서 만든 원문은 문자와 화면(토큰)으로만
 * 나갑니다.
 */
export type VerificationPurpose = "find_id" | "reset_password";

/** 인증번호 유효시간 3분 — 문자로 받아 입력하기에 충분하고, 재사용 창은 짧게. */
const CODE_TTL_MS = 3 * 60 * 1000;
/** 인증 성공 후 아이디 확인·비밀번호 변경까지 주는 시간. */
const TOKEN_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
/** 같은 번호로 1시간에 5건까지. 문자 요금과 스팸 신고를 막는 선입니다. */
const MAX_SENDS_PER_HOUR = 5;
/** 연타 방지 — 직전 발송 후 30초. */
const RESEND_COOLDOWN_MS = 30 * 1000;

export const digitsOnly = (value: string) => value.replace(/\D/g, "");

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** 6자리는 사전 대입이 쉬워, 번호를 소금처럼 섞어 해싱합니다. */
const codeHash = (phone: string, code: string) => hash(`${phone}:${code}`);

function equals(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export type SendCodeResult = { success: boolean; message: string };

/**
 * 인증번호 발송. 본인 확인(이름·아이디 일치)은 호출부에서 **먼저** 끝낸 뒤
 * 부르세요. 여기서는 번호에 대한 발송 제한만 봅니다.
 */
export async function sendVerificationCode(
  phoneInput: string,
  purpose: VerificationPurpose,
): Promise<SendCodeResult> {
  const phone = digitsOnly(phoneInput);
  if (!/^01[016789]\d{7,8}$/.test(phone)) {
    return { success: false, message: "휴대폰 번호를 정확히 입력해주세요." };
  }

  const supabase = await createClient();
  const now = Date.now();

  const { data: recent } = await supabase
    .from("phone_verifications")
    .select("created_at")
    .eq("phone", phone)
    .gte("created_at", new Date(now - 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false });

  const sends = recent ?? [];
  if (sends.length >= MAX_SENDS_PER_HOUR) {
    return {
      success: false,
      message: "인증 요청이 너무 많습니다. 1시간 뒤에 다시 시도해주세요.",
    };
  }
  const lastSentAt = sends[0]?.created_at ? Date.parse(sends[0].created_at) : 0;
  if (now - lastSentAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000);
    return { success: false, message: `${wait}초 후에 다시 요청해주세요.` };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

  const { error } = await supabase.from("phone_verifications").insert({
    purpose,
    phone,
    code_hash: codeHash(phone, code),
    expires_at: new Date(now + CODE_TTL_MS).toISOString(),
  });

  if (error) {
    console.error("[phone-verification] 저장 실패", error.message);
    return { success: false, message: "인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  // 문자를 먼저 보내고 저장에 실패하면 요금만 나가므로 저장 → 발송 순서입니다.
  const sent = await sendSms(phone, `[한평생직업훈련] 인증번호 ${code} (3분 내 입력)`);
  if (!sent.success) {
    return { success: false, message: sent.message };
  }

  return { success: true, message: "인증번호를 문자로 보냈습니다. (3분 내 입력)" };
}

export type VerifyCodeResult =
  | { success: true; token: string }
  | { success: false; message: string };

/** 인증번호 확인. 성공하면 다음 단계(아이디 확인·비밀번호 변경)용 1회용 토큰을 줍니다. */
export async function verifyCode(
  phoneInput: string,
  codeInput: string,
  purpose: VerificationPurpose,
): Promise<VerifyCodeResult> {
  const phone = digitsOnly(phoneInput);
  const code = digitsOnly(codeInput);
  if (code.length !== 6) {
    return { success: false, message: "인증번호 6자리를 입력해주세요." };
  }

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data: row } = await supabase
    .from("phone_verifications")
    .select("id, code_hash, attempts, expires_at")
    .eq("phone", phone)
    .eq("purpose", purpose)
    .is("verified_at", null)
    .gt("expires_at", nowIso)
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) {
    return { success: false, message: "인증번호가 만료되었습니다. 다시 요청해주세요." };
  }

  if (!equals(row.code_hash, codeHash(phone, code))) {
    await supabase
      .from("phone_verifications")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    const left = MAX_ATTEMPTS - row.attempts - 1;
    return {
      success: false,
      message:
        left > 0
          ? `인증번호가 일치하지 않습니다. (${left}회 남음)`
          : "인증 횟수를 초과했습니다. 인증번호를 다시 요청해주세요.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const { error } = await supabase
    .from("phone_verifications")
    .update({
      verified_at: nowIso,
      token_hash: hash(token),
      // 토큰 유효시간은 인증번호와 별개라 만료 시각을 다시 잡습니다.
      expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    })
    .eq("id", row.id);

  if (error) {
    console.error("[phone-verification] 인증 처리 실패", error.message);
    return { success: false, message: "인증 처리에 실패했습니다. 다시 시도해주세요." };
  }

  return { success: true, token };
}

export type ConsumeResult =
  | { success: true; phone: string }
  | { success: false; message: string };

/**
 * 토큰을 실제로 사용합니다(1회용). 성공하면 인증된 번호를 돌려주므로,
 * 호출부는 **그 번호로 다시 회원을 찾아** 처리하면 됩니다.
 */
export async function consumeVerificationToken(
  token: string,
  purpose: VerificationPurpose,
): Promise<ConsumeResult> {
  if (!token) {
    return { success: false, message: "휴대폰 인증을 먼저 완료해주세요." };
  }

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data: row } = await supabase
    .from("phone_verifications")
    .select("id, phone")
    .eq("token_hash", hash(token))
    .eq("purpose", purpose)
    .not("verified_at", "is", null)
    .is("consumed_at", null)
    .gt("expires_at", nowIso)
    .maybeSingle();

  if (!row) {
    return { success: false, message: "인증이 만료되었습니다. 처음부터 다시 진행해주세요." };
  }

  const { error } = await supabase
    .from("phone_verifications")
    .update({ consumed_at: nowIso })
    .eq("id", row.id)
    .is("consumed_at", null);

  if (error) {
    return { success: false, message: "인증 확인에 실패했습니다. 다시 시도해주세요." };
  }

  return { success: true, phone: row.phone };
}
