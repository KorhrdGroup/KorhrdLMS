import { createClient } from "@/lib/supabase/server";

/**
 * 카카오 "연결 끊기" 콜백 — 카카오 개발자센터 > 카카오 로그인 > 고급 설정에 등록합니다.
 *   https://korhrd-lms.vercel.app/api/auth/kakao/unlink
 *
 * 사용자가 카카오 계정 설정에서 연결을 끊거나 탈퇴하면 카카오가 알려줍니다.
 * 네이버와 같이 **회원은 지우지 않고 `kakao_id` 만 비웁니다** — 수강이력이
 * 남아 있고, 다시 카카오로 로그인하면 휴대폰 번호로 같은 계정에 이어붙습니다.
 *
 * 카카오는 POST(form) 로 `app_id`·`user_id`·`referrer_type` 을 보냅니다.
 * 다만 문서·시점에 따라 이름이 달라질 수 있어 넓게 받고, 어떤 경우에도 200 을
 * 돌려줍니다(실패를 알리면 카카오가 계속 재시도합니다).
 */
export const dynamic = "force-dynamic";

const USER_KEYS = ["user_id", "id", "kakao_id", "userId"];
const APP_KEYS = ["app_id", "appId"];

function pick(params: URLSearchParams, keys: string[]): string | null {
  for (const key of keys) {
    const value = params.get(key)?.trim();
    if (value) return value;
  }
  return null;
}

async function handle(params: URLSearchParams) {
  const userId = pick(params, USER_KEYS);
  const appId = pick(params, APP_KEYS);

  if (!userId) {
    console.warn("[kakao] 연결 끊기 — 사용자 식별자 없음", params.toString());
    return Response.json({ ok: true });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .update({ kakao_id: null })
    .eq("kakao_id", userId)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[kakao] 연결 끊기 처리 실패", error.message);
  } else {
    console.info("[kakao] 연결 끊기 완료", { appId, userId, 해제된회원: data?.length ?? 0 });
  }

  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const json = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(json)) {
      if (value != null) params.set(key, String(value));
    }
    return handle(params);
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = new URLSearchParams(await request.text());
    for (const [key, value] of url.searchParams) {
      if (!body.has(key)) body.set(key, value);
    }
    return handle(body);
  }

  return handle(url.searchParams);
}

/** 카카오 설정 화면에서 주소 확인용으로 GET 을 눌러보는 경우가 있습니다 */
export async function GET(request: Request) {
  return handle(new URL(request.url).searchParams);
}
