import { createClient } from "@/lib/supabase/server";

/**
 * 공지사항 첨부파일 내려받기.
 *
 * 첨부는 Supabase Storage(다른 출처)에 있어 브라우저가 `<a download>` 를
 * 무시하고 현재 창에서 열어 버립니다(교안 다운로드와 같은 문제 —
 * `src/app/api/materials/[id]/download/route.ts` 참고).
 * 같은 출처인 이 경로로 한 번 받아 `attachment` 로 바꿔 흘려보냅니다.
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
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase
    .from("notices")
    .select("attachment_file_name, attachment_file_url")
    .eq("id", id)
    .is("deleted_at", null)
    .eq("is_published", true)
    .maybeSingle();

  const row = data as {
    attachment_file_name: string | null;
    attachment_file_url: string | null;
  } | null;
  if (!row?.attachment_file_url) {
    return new Response("첨부파일을 찾을 수 없습니다.", { status: 404 });
  }

  const upstream = await fetch(row.attachment_file_url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("파일을 가져오지 못했습니다.", { status: 502 });
  }

  const fileName = row.attachment_file_name?.trim() || "첨부파일";
  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
    "Content-Disposition": contentDisposition(fileName),
    "Cache-Control": "private, max-age=0, must-revalidate",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { headers });
}
