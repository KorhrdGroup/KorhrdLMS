import { createClient } from "@/lib/supabase/server";

/**
 * 학습자료(교안) 내려받기.
 *
 * 파일은 R2(다른 출처)에 있고 `Content-Disposition: inline` 으로 올려 뒀습니다.
 * 미리보기는 그래야 새 탭에서 바로 열리기 때문입니다. 그런데 브라우저는
 * **다른 출처 링크에는 `<a download>` 를 무시**해서, 다운로드 칸을 눌러도
 * 그냥 현재 창에서 열려 버렸습니다.
 *
 * 그래서 같은 출처인 이 경로로 한 번 받아 `attachment` 로 바꿔 흘려보냅니다.
 * 파일을 통째로 메모리에 올리지 않고 스트림 그대로 넘깁니다(교안은 최대 79MB).
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
    .from("learning_materials")
    .select("file_name, file_url")
    .eq("id", id)
    .is("deleted_at", null)
    .eq("is_published", true)
    .maybeSingle();

  const row = data as { file_name: string | null; file_url: string | null } | null;
  if (!row?.file_url) {
    return new Response("자료를 찾을 수 없습니다.", { status: 404 });
  }

  const upstream = await fetch(row.file_url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("파일을 가져오지 못했습니다.", { status: 502 });
  }

  const fileName = row.file_name?.trim() || "교안.pdf";
  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
    "Content-Disposition": contentDisposition(fileName),
    "Cache-Control": "private, max-age=0, must-revalidate",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { headers });
}
