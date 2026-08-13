import { cookies } from "next/headers";

import { ADMIN_SESSION_MARKER_COOKIE } from "@/features/admin-auth/constants";
import { signProtectedMediaUrl } from "@/lib/r2/signed-url";
import { createClient } from "@/lib/supabase/server";

/**
 * 발급신청 증명사진 내려받기 (어드민 전용).
 *
 * 사진은 R2(다른 출처)에 있어 브라우저 fetch 가 CORS 에 막히고,
 * 다른 출처 링크에는 `<a download>` 도 무시됩니다. 그래서 같은 출처인
 * 이 경로가 서명 URL로 받아 `attachment` 로 바꿔 흘려보냅니다.
 * 개인정보(증명사진)라 어드민 세션 마커 쿠키가 없으면 거부합니다.
 */
export const dynamic = "force-dynamic";

/** 한글 파일명은 그대로 못 넣습니다. RFC 5987 형식으로 함께 실어 보냅니다. */
function contentDisposition(fileName: string) {
  const ascii = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_SESSION_MARKER_COOKIE)) {
    return new Response("관리자만 내려받을 수 있습니다.", { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificate_applications")
    .select("applicant_name, photo_url")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  const row = data as { applicant_name: string; photo_url: string | null } | null;
  if (!row?.photo_url) {
    return new Response("사진을 찾을 수 없습니다.", { status: 404 });
  }

  const upstream = await fetch(signProtectedMediaUrl(row.photo_url) ?? row.photo_url, {
    cache: "no-store",
  });
  if (!upstream.ok || !upstream.body) {
    return new Response("사진을 가져오지 못했습니다.", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  const ext = (contentType.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": contentDisposition(`${row.applicant_name}_증명사진.${ext}`),
    "Cache-Control": "private, max-age=0, must-revalidate",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { headers });
}
