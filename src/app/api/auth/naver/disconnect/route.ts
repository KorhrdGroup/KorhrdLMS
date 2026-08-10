import { createClient } from "@/lib/supabase/server";

/**
 * 네이버 "연결 끊기" 콜백 — 네이버 개발자센터에 등록하는 주소입니다.
 *   https://korhrd-lms.vercel.app/api/auth/naver/disconnect
 *
 * 사용자가 네이버 프로필 > 연결된 서비스 관리에서 연동을 해제하거나 네이버
 * 회원을 탈퇴하면 네이버가 이 주소로 알려줍니다. 우리는 그 회원의 `naver_id`
 * 만 지웁니다 — **회원 자체는 지우지 않습니다.** 수강이력·자격증이 남아 있고,
 * 다시 네이버로 로그인하면 휴대폰 번호로 같은 계정에 다시 이어붙습니다.
 *
 * 응답은 어떤 경우에도 200 입니다. 실패를 알리면 네이버가 계속 재시도하는데,
 * 우리 쪽에서 할 수 있는 일이 없는 요청(모르는 사용자 등)이 대부분입니다.
 * 처리 결과는 서버 로그로만 남깁니다.
 */
export const dynamic = "force-dynamic";

/** 네이버가 보내는 파라미터 이름이 문서·시점에 따라 달라 넓게 받습니다 */
const USER_KEYS = ["user_id", "id", "naver_id", "uid", "userId"];
const CLIENT_KEYS = ["client_id", "oauth_consumer_key", "clientId"];

function pick(params: URLSearchParams, keys: string[]): string | null {
  for (const key of keys) {
    const value = params.get(key)?.trim();
    if (value) return value;
  }
  return null;
}

async function handle(params: URLSearchParams) {
  const clientId = pick(params, CLIENT_KEYS);
  const userId = pick(params, USER_KEYS);

  // 우리 앱으로 온 요청이 맞는지 (보내주지 않으면 검사하지 않습니다)
  const expected = process.env.NAVER_CLIENT_ID?.trim();
  if (clientId && expected && clientId !== expected) {
    console.warn("[naver] 연결 끊기 — 다른 앱의 요청", clientId);
    return Response.json({ ok: true });
  }

  if (!userId) {
    console.warn("[naver] 연결 끊기 — 사용자 식별자 없음", params.toString());
    return Response.json({ ok: true });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .update({ naver_id: null })
    .eq("naver_id", userId)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[naver] 연결 끊기 처리 실패", error.message);
  } else {
    console.info("[naver] 연결 끊기 완료", { userId, 해제된회원: data?.length ?? 0 });
  }

  return Response.json({ ok: true });
}

export async function GET(request: Request) {
  return handle(new URL(request.url).searchParams);
}

/** 네이버가 POST(form) 로 보내는 경우도 있어 함께 받습니다 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = new URLSearchParams(await request.text());
    for (const [key, value] of url.searchParams) {
      if (!body.has(key)) body.set(key, value);
    }
    return handle(body);
  }

  return handle(url.searchParams);
}
