/**
 * 과정 교안(PDF)을 R2에 올리고 learning_materials 에 연결합니다.
 *
 *   node scripts/upload-handouts.mjs --dry     # 무엇을 올릴지만 확인
 *   node scripts/upload-handouts.mjs --missing # 아직 교안이 없는 과정만
 *   node scripts/upload-handouts.mjs           # 전부 다시 올리기
 *
 * 교안은 원본 폴더(~/Desktop/한직훈/{과정폴더})에 흩어져 있고, hwp·pptx 였던 것은
 * 따로 PDF로 변환해 ~/Desktop/교안pdf변환 에 모아 두었습니다. 두 곳을 함께 훑되
 * **변환본을 우선**합니다(브라우저 미리보기가 되는 건 PDF뿐입니다).
 *
 * 키 규칙은 R2 영상·이미지와 같습니다 — 한글 파일명은 macOS(NFD)와 URL(NFC)
 * 정규화가 어긋나 404가 나므로 반드시 ASCII로 만듭니다.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import dotenv from "dotenv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const DRY = process.argv.includes("--dry");
/** 이미 올라간 과정은 건너뜁니다 — 빠진 것만 채울 때 씁니다(같은 파일을 다시 올리지 않도록) */
const ONLY_MISSING = process.argv.includes("--missing");
const ROOT = "/Users/korhrd/Desktop/한직훈";
const CONVERTED = "/Users/korhrd/Desktop/교안pdf변환";
const nfc = (s) => s.normalize("NFC");

/* ---------- 원본 폴더에서 교안 찾기 ---------- */
function walk(dir, depth = 0) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store" || name.startsWith(".~lock")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (depth < 2) out.push(...walk(p, depth + 1));
    } else out.push({ path: p, name: nfc(name), size: st.size });
  }
  return out;
}

const HANDOUT = /(교안|강의자료|교재)/;
const isPdf = (n) => /\.pdf$/i.test(n);

function pickPdfHandout(files) {
  const pdfs = files.filter((f) => isPdf(f.name) && !/예상문제|목차|차례|정보/.test(f.name));
  if (!pdfs.length) return null;
  const named = pdfs.filter((f) => HANDOUT.test(f.name));
  const pool = named.length ? named : pdfs;
  return [...pool].sort((a, b) => b.size - a.size)[0];
}

/** 폴더명 ↔ 과정명 대조용 정규화 */
const norm = (s) =>
  nfc(s)
    .replace(/[_\-].*$/, "")
    .replace(/[\s_\-&[\]()]/g, "")
    .replace(/\d*급$/, "")
    .replace(/(신규|최신|최종|참고|전문가과정)/g, "")
    .toLowerCase();

/** 폴더명이 과정명과 달라 자동으로 못 잇는 것들 */
const FOLDER_TO_COURSE = {
  "디지털리터러시-7최낙조": "디지털리터러시지도사",
  디지털중독예방: "디지털중독예방지도사",
  메이크업: "메이크업코디네이터",
  헤어미용: "헤어코디네이터",
  클레이아트: "클레이아트지도사",
  "시니어&실버인지활동지도사": "실버인지활동지도사",
  조향사_김창혁: "조향사[향수디자이너]",
  안전관리사_이민태: "안전관리사/안전교육지도사",
  아동공예지도자: "아동공예지도자 [8종 공예과정]",
  방과후지도사_신규: "방과후학교지도사",
  다문화가정복지상담사_신규: "다문화심리상담사",
};

/** 변환본 파일명 → 과정명 (변환하며 이름이 제각각이 되어 직접 지정합니다) */
const CONVERTED_TO_COURSE = {
  "SNS마케팅전문가_교안.pdf": "SNS마케팅전문가",
  "도시농업관리사.pdf": "도시농업전문가",
  "독서심리상담사_신규.pdf": "독서심리상담사",
  "미술심리상담사_신규.pdf": "미술심리상담사",
  "방과후아동지도사.pdf": "방과후아동지도사",
  "방역관리사.pdf": "방역관리사",
  "병원코디네이터.pdf": "병원코디네이터1급",
  "실버보드게임지도사.pdf": "실버보드게임지도사",
  "아동공예지도자.pdf": "아동공예지도자 [8종 공예과정]",
  "아동미술심리상담사.pdf": "아동미술심리상담사",
  "안전교육지도사.pdf": "안전관리사/안전교육지도사",
  "유품정리사_교안.pdf": "유품정리사",
  "은퇴설계전문가_교안.pdf": "은퇴설계전문가",
  "음악심리상담사_교안.pdf": "음악심리상담사",
  "인형극공연지도사.pdf": "인형극공연지도사",
  "자기주도 학습지도사.pdf": "자기주도학습지도사",
  "자원봉사지도사.pdf": "자원봉사지도사1급",
  "조향사.pdf": "조향사[향수디자이너]",
  "종이접기지도사.pdf": "종이접기지도사",
  "지역아동교육지도사 전 차시 통합 교안.pdf": "지역아동교육지도사1급",
  "타로심리상담사.pdf": "타로심리상담사",
  "환경관리전문가.pdf": "환경관리전문가",
  "다문화가정복지상담사_신규.pdf": "다문화심리상담사",
};

/* ---------- 과정 목록 ---------- */
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const { rows: courses } = await client.query(
  `SELECT id, code, name FROM courses WHERE deleted_at IS NULL AND status='active'`,
);
const byName = new Map(courses.map((c) => [nfc(c.name), c]));
const byNorm = new Map(courses.map((c) => [norm(c.name), c]));

/* ---------- 올릴 목록 만들기 (변환본 우선) ---------- */
const plan = new Map(); // courseId → { course, file }
const problems = [];

for (const name of readdirSync(CONVERTED)) {
  if (!isPdf(name)) continue;
  const key = nfc(name);
  const courseName = CONVERTED_TO_COURSE[key];
  const course = courseName ? byName.get(courseName) : null;
  if (!course) {
    problems.push(`변환본 매칭 실패: ${key}`);
    continue;
  }
  const p = join(CONVERTED, name);
  plan.set(course.id, { course, file: { path: p, name: key, size: statSync(p).size }, from: "변환본" });
}

for (const folder of readdirSync(ROOT)) {
  if (folder.startsWith(".")) continue;
  if (!statSync(join(ROOT, folder)).isDirectory()) continue;
  const f = nfc(folder);
  const course = FOLDER_TO_COURSE[f] ? byName.get(FOLDER_TO_COURSE[f]) : byNorm.get(norm(f));
  if (!course) continue;
  if (plan.has(course.id)) continue; // 변환본이 이미 있으면 그대로 둡니다
  const pick = pickPdfHandout(walk(join(ROOT, folder)));
  if (!pick) continue;
  plan.set(course.id, { course, file: { ...pick, name: nfc(pick.name) }, from: "원본" });
}

let items = [...plan.values()].sort((a, b) => a.course.name.localeCompare(b.course.name, "ko"));

if (ONLY_MISSING) {
  const { rows: already } = await client.query(
    `SELECT DISTINCT course_id FROM learning_materials
     WHERE deleted_at IS NULL AND title LIKE '%교안%'`,
  );
  const has = new Set(already.map((r) => r.course_id));
  const before = items.length;
  items = items.filter((i) => !has.has(i.course.id));
  console.log(`이미 올라간 ${before - items.length}개는 건너뜁니다.\n`);
}
const mb = (n) => (n / 1024 / 1024).toFixed(1);
const total = items.reduce((s, i) => s + i.file.size, 0);

console.log(`올릴 교안 ${items.length}개 · 합계 ${mb(total)}MB`);
console.log(`  변환본 ${items.filter((i) => i.from === "변환본").length}개 · 원본 PDF ${items.filter((i) => i.from === "원본").length}개`);
if (problems.length) console.log(`\n[확인 필요]\n  ${problems.join("\n  ")}`);

const missing = courses.filter((c) => !plan.has(c.id)).map((c) => c.name);
console.log(`\n교안이 없는 과정 ${missing.length}개: ${missing.join(", ")}`);

if (DRY) {
  console.log("\n--- 올릴 목록 ---");
  items.forEach((i) => console.log(`  ${i.course.name}  ←  ${i.file.name} (${mb(i.file.size)}MB, ${i.from})`));
  await client.end();
  process.exit(0);
}

/* ---------- R2 업로드 + DB 등록 ---------- */
const cfg = {
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
  publicBaseUrl: process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, ""),
};
const s3 = new S3Client({
  region: "auto",
  endpoint: cfg.endpoint,
  credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
});

let done = 0;
for (const item of items) {
  const body = readFileSync(item.file.path);
  // 키는 과정 코드로 만듭니다 — 과정명이 한글이라 ASCII로 바꿔도 충돌 위험이 있습니다.
  const key = `handouts/${item.course.code}/handout.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
      // 미리보기가 새 창에서 열려야 하므로 inline 입니다(다운로드는 <a download>가 처리).
      ContentDisposition: `inline; filename="${basename(key)}"`,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  const url = `${cfg.publicBaseUrl}/${key}`;

  // 다시 돌려도 같은 과정에 교안이 쌓이지 않도록 기존 교안을 먼저 치웁니다.
  await client.query(
    `UPDATE learning_materials SET deleted_at=NOW()
     WHERE course_id=$1 AND title LIKE '%교안%' AND deleted_at IS NULL`,
    [item.course.id],
  );
  await client.query(
    `INSERT INTO learning_materials
       (course_id, title, description, file_type, file_name, file_size_label, file_url, is_published)
     VALUES ($1, $2, $3, 'PDF', $4, $5, $6, true)`,
    [
      item.course.id,
      `${item.course.name} 교안`,
      "전 차시 통합 교안입니다. 미리보기로 바로 보거나 내려받아 보실 수 있습니다.",
      item.file.name,
      `${mb(item.file.size)}MB`,
      url,
    ],
  );

  done += 1;
  console.log(`[${done}/${items.length}] ${item.course.name} · ${mb(item.file.size)}MB`);
}

await client.end();
console.log(`\n업로드·연결 완료 ${done}개`);
