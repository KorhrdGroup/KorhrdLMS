/**
 * 교수 사진을 R2에 올리고 professors.photo_url 에 연결합니다.
 *
 * 어드민(/admin/professors)에서 올리는 것과 같은 경로·같은 키 규칙을 씁니다.
 * 로컬에 있는 사진 파일을 바로 올릴 때 사용합니다.
 *
 * 사용법:
 *   node scripts/upload-professor-photo.mjs "임미영 교수" ~/Downloads/IMMY.png
 *   node scripts/upload-professor-photo.mjs "임미영 교수" ~/Downloads/IMMY.png --dry-run
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import pg from "pg";

const CHO = [
  "g", "kk", "n", "d", "tt", "r", "m", "b", "pp",
  "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h",
];
const JUNG = [
  "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o",
  "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu",
  "eu", "ui", "i",
];
const JONG = [
  "", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l",
  "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t",
];
const SURNAME_STYLE = [
  [/^gim/, "kim"],
  [/^bak/, "park"],
  [/^bag/, "park"],
];

/** src/features/professors/lib/professor-photo-key.ts 와 같은 규칙 */
function professorPhotoKey(name) {
  const bare = name.replace(/\s*(교수님|교수|강사님|강사)\s*$/, "").trim();
  let key = "";
  for (const ch of bare) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const index = code - 0xac00;
      key += CHO[Math.floor(index / 588)];
      key += JUNG[Math.floor((index % 588) / 28)];
      key += JONG[index % 28];
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      key += ch.toLowerCase();
    }
  }
  for (const [pattern, replacement] of SURNAME_STYLE) {
    if (pattern.test(key)) {
      key = key.replace(pattern, replacement);
      break;
    }
  }
  return key || "professor";
}

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const [, , rawName, rawFile, ...flags] = process.argv;
const dryRun = flags.includes("--dry-run");

if (!rawName || !rawFile) {
  console.error('사용법: node scripts/upload-professor-photo.mjs "임미영 교수" ~/Downloads/IMMY.png');
  process.exit(1);
}

const filePath = rawFile.replace(/^~/, process.env.HOME ?? "");
if (!fs.existsSync(filePath)) {
  console.error(`파일이 없습니다: ${filePath}`);
  process.exit(1);
}

const ext = path.extname(filePath).toLowerCase();
const contentType = CONTENT_TYPES[ext];
if (!contentType) {
  console.error(`JPG, PNG, WEBP만 올릴 수 있습니다 (받은 확장자: ${ext})`);
  process.exit(1);
}

const professorName = rawName.normalize("NFC");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `SELECT id, name, photo_url FROM public.professors
    WHERE name = $1 AND deleted_at IS NULL`,
  [professorName],
);

if (rows.length === 0) {
  console.error(`professors 테이블에 "${professorName}" 이(가) 없습니다.`);
  await client.end();
  process.exit(1);
}
if (rows.length > 1) {
  console.error(`"${professorName}" 이(가) ${rows.length}건입니다. 먼저 정리해주세요.`);
  await client.end();
  process.exit(1);
}

const professor = rows[0];
const body = fs.readFileSync(filePath);
// 어드민 업로드와 같은 키 규칙: professors/<로마자>-<타임스탬프>.<확장자>
const key = `professors/${professorPhotoKey(professorName)}-${Date.now()}${ext}`;
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "");
const url = `${publicBaseUrl}/${key}`;

console.log(`교수     : ${professor.name} (${professor.id})`);
console.log(`기존 사진: ${professor.photo_url ?? "(없음)"}`);
console.log(`파일     : ${filePath} (${(body.length / 1024).toFixed(1)}KB, ${contentType})`);
console.log(`R2 키    : ${key}`);
console.log(`공개 URL : ${url}`);

if (dryRun) {
  console.log("\n--dry-run 이라 업로드하지 않았습니다.");
  await client.end();
  process.exit(0);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

await s3.send(
  new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }),
);
console.log("\nR2 업로드 완료");

await client.query(
  `UPDATE public.professors SET photo_url = $1, updated_at = now() WHERE id = $2`,
  [url, professor.id],
);
console.log("professors.photo_url 갱신 완료");

await client.end();
