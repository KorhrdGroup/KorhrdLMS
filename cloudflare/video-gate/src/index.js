/**
 * videokorhrd.com 서명 검증 게이트 (Cloudflare Worker).
 *
 * R2 버킷(lms-video)의 커스텀 도메인 트래픽을 가로채, 만료시각 서명(ex/sig)이
 * 유효한 요청만 통과시킵니다. 서명은 LMS 서버(src/lib/r2/signed-url.ts)가
 * 같은 비밀키(SIGNING_SECRET)로 만듭니다.
 *
 *  - 공개 경로(PUBLIC_PREFIXES)는 서명 없이 서빙 — 교수 사진처럼 공개
 *    페이지에 쓰이는 파일들입니다.
 *  - 서명 대상 문자열은 LMS와 동일하게 "디코드된 경로(NFC):만료초" —
 *    한글 경로의 인코딩/NFD 차이를 흡수합니다.
 *  - 영상 탐색(seek)을 위해 Range 요청(206)을 지원합니다.
 */

const PUBLIC_PREFIXES = ["/professors/"];

function hexToBytes(hex) {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function verifySignature(secret, message, sigHex) {
  const sigBytes = hexToBytes(sigHex);
  if (!sigBytes) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  // crypto.subtle.verify 는 타이밍 안전 비교를 보장합니다
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(message));
}

function baseHeaders(object) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  if (!headers.has("cache-control")) {
    // 브라우저 캐시만 허용 — 서명이 붙은 주소는 URL이 매번 달라 CDN 캐시 효율이
    // 낮으므로 엣지 캐시는 쓰지 않습니다
    headers.set("cache-control", "public, max-age=14400");
  }
  return headers;
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(request.url);
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(url.pathname).normalize("NFC");
    } catch {
      return new Response("Bad Request", { status: 400 });
    }
    const key = decodedPath.replace(/^\/+/, "");
    if (!key) {
      return new Response("Not Found", { status: 404 });
    }

    const isPublic = PUBLIC_PREFIXES.some((prefix) => decodedPath.startsWith(prefix));

    if (!isPublic) {
      const expires = Number(url.searchParams.get("ex"));
      const signature = url.searchParams.get("sig") ?? "";

      if (!Number.isFinite(expires) || !signature) {
        return new Response("Forbidden", { status: 403 });
      }
      if (expires < Math.floor(Date.now() / 1000)) {
        return new Response("Link Expired", { status: 403 });
      }
      const valid = await verifySignature(env.SIGNING_SECRET, `${decodedPath}:${expires}`, signature);
      if (!valid) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    if (request.method === "HEAD") {
      const head = await env.BUCKET.head(key);
      if (!head) return new Response(null, { status: 404 });
      const headers = baseHeaders(head);
      headers.set("content-length", String(head.size));
      return new Response(null, { status: 200, headers });
    }

    // Range 요청(영상 탐색) 처리 — "bytes=시작-끝" / "bytes=시작-" / "bytes=-마지막N"
    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
      if (!match || (match[1] === "" && match[2] === "")) {
        return new Response("Invalid Range", { status: 416 });
      }

      let range;
      if (match[1] === "") {
        range = { suffix: Number(match[2]) };
      } else if (match[2] === "") {
        range = { offset: Number(match[1]) };
      } else {
        const offset = Number(match[1]);
        const end = Number(match[2]);
        if (end < offset) return new Response("Invalid Range", { status: 416 });
        range = { offset, length: end - offset + 1 };
      }

      const object = await env.BUCKET.get(key, { range });
      if (!object) return new Response("Not Found", { status: 404 });

      const size = object.size;
      const offset = range.suffix !== undefined ? Math.max(0, size - range.suffix) : range.offset;
      const length =
        range.suffix !== undefined
          ? Math.min(range.suffix, size)
          : Math.min(range.length ?? size - offset, size - offset);

      const headers = baseHeaders(object);
      headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${size}`);
      headers.set("content-length", String(length));
      return new Response(object.body, { status: 206, headers });
    }

    const object = await env.BUCKET.get(key);
    if (!object) return new Response("Not Found", { status: 404 });

    const headers = baseHeaders(object);
    headers.set("content-length", String(object.size));
    return new Response(object.body, { status: 200, headers });
  },
};
