"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

/**
 * 페이지 방문 한 건을 page_views 에 남깁니다 (PageViewTracker 가 화면 이동마다 부릅니다).
 * 회원 정보는 남기지 않습니다. visitorId 는 브라우저 쿠키(hp_vid)의 임의 UUID 입니다.
 * 기록 실패는 무시합니다 — 방문 집계가 화면 동작을 깨면 안 됩니다.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function recordPageViewAction(input: { path: string; visitorId: string }) {
  const { path, visitorId } = input;
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 300) return;
  if (path.startsWith("/admin")) return;
  if (typeof visitorId !== "string" || !UUID.test(visitorId)) return;
  if (BOT.test((await headers()).get("user-agent") ?? "")) return;

  let readable = path;
  try {
    readable = decodeURIComponent(path);
  } catch {
    // 깨진 인코딩이면 받은 그대로 남깁니다
  }

  const supabase = await createClient();
  await supabase.from("page_views").insert({ path: readable, visitor_id: visitorId });
}
