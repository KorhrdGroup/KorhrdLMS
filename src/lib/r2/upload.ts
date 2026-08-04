import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 업로드.
 *
 * 강의 영상이 이미 R2(`lms-video` 버킷)에 있어 이미지도 같은 곳에 둡니다.
 * R2는 브라우저에서 직접 올릴 수 없으므로(자격증명 노출) 서버에서만 사용합니다.
 *
 * 키는 반드시 ASCII로 만듭니다. 한글 파일명은 macOS(NFD)와 URL(NFC) 정규화가
 * 어긋나 공개 URL이 404가 납니다 — 영상 이전 때 겪은 문제입니다.
 */

const REQUIRED = [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_BASE_URL",
] as const;

function readConfig() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `R2 설정이 없습니다(${missing.join(", ")}). .env.local을 확인해주세요.`,
    );
  }

  return {
    endpoint: process.env.R2_ENDPOINT!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucket: process.env.R2_BUCKET!,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL!.replace(/\/+$/, ""),
  };
}

let client: S3Client | null = null;

function getClient(endpoint: string, accessKeyId: string, secretAccessKey: string) {
  client ??= new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

/** 업로드 키에 쓸 수 있도록 ASCII만 남깁니다. 한글 등은 제거되므로 호출부에서 slug를 넘겨주세요. */
function sanitize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/^[-.]+/, "")
    .slice(0, 60);
}

export type R2UploadInput = {
  /** 버킷 내 디렉터리 (예: "professors") */
  prefix: string;
  /** 확장자를 뺀 파일명. ASCII 권장 — 비면 타임스탬프만 사용합니다. */
  baseName: string;
  contentType: string;
  body: Uint8Array;
  /** 원본 파일명(확장자 추출용) */
  fileName: string;
};

/** R2에 올리고 공개 URL을 돌려줍니다. */
export async function uploadToR2({
  prefix,
  baseName,
  contentType,
  body,
  fileName,
}: R2UploadInput): Promise<string> {
  const cfg = readConfig();
  const ext = (fileName.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? "").toLowerCase();
  const safeBase = sanitize(baseName) || String(Date.now());
  // 같은 교수의 사진을 다시 올려도 캐시된 옛 이미지가 보이지 않도록 접미사를 붙입니다.
  const key = `${prefix}/${safeBase}-${Date.now()}${ext}`;

  await getClient(cfg.endpoint, cfg.accessKeyId, cfg.secretAccessKey).send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${cfg.publicBaseUrl}/${key}`;
}
