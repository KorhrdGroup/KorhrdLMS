/**
 * korhrd 디자인의 과정 데이터(src/features/korhrd/data/courses.ts)를 DB와 동기화합니다.
 *
 * 화면 분류(목적 p·연령 a·분야 c·순위 rank 등)는 전달본에만 있으므로 유지하고,
 * DB가 정본인 필드만 코드(CRS-KH-xxxx) 기준으로 덮어씁니다:
 *   prof(담당교수) · reg(등록번호) · g(주무부처) · fee(발급비) · lessons(차시 수)
 * DB에서 비공개(hidden)·삭제된 과정은 목록에서 뺍니다.
 *
 * 과정명 n 은 목업(합격후기·수강내역)이 참조하는 키라 그대로 두되,
 * DB에서 이름이 바뀐 과정은 NAME_OVERRIDES 로 함께 바꿉니다(참조 파일도 일괄 치환).
 *
 * 사용법: node --env-file=.env.local scripts/sync-korhrd-courses.mjs
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const DATA = path.join(process.cwd(), "src/features/korhrd/data/courses.ts");
const REF_FILES = [
  "src/features/korhrd/data/reviews.ts",
  "src/features/korhrd/data/enrollments.ts",
  "src/features/korhrd/data/jobs.ts",
  "src/features/korhrd/data/liveFeed.ts",
  "src/features/korhrd/data/courseDetail.ts",
].map((p) => path.join(process.cwd(), p));

// DB에서 과정명이 바뀐 것: 전달본 표기 → 현재 표기 (급수 표기는 유지)
const NAME_OVERRIDES = {
  "아동미술심리상담사 & 아동미술지도사 1급": "아동미술심리상담사 1급",
};

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query(
  `SELECT c.code, c.name, c.status, c.license_number, c.supervising_agency,
          c.certificate_fee, c.thumbnail_url, COALESCE(p.name, c.professor_name) AS prof,
          (SELECT count(*)::int FROM public.lecture_sessions ls
             JOIN public.course_lectures cl ON cl.id = ls.lecture_id
            WHERE cl.course_id = c.id) AS lessons
     FROM public.courses c
     LEFT JOIN public.professors p ON p.id = c.professor_id
    WHERE c.deleted_at IS NULL`,
);
await client.end();
const db = new Map(rows.map((r) => [r.code, r]));

const src = fs.readFileSync(DATA, "utf-8");
const lines = src.split("\n");
let updated = 0, removed = 0;
const out = lines.filter((line) => {
  const m = line.match(/"code":\s*"(CRS-KH-\d+)"/);
  if (!m) return true;
  const row = db.get(m[1]);
  if (!row || row.status !== "active") {
    removed++;
    return false; // 비공개·삭제 과정은 목록에서 제외
  }
  return true;
}).map((line) => {
  const m = line.match(/"code":\s*"(CRS-KH-\d+)"/);
  if (!m) return line;
  const row = db.get(m[1]);
  let next = line
    .replace(/"prof":\s*"[^"]*"/, `"prof": ${JSON.stringify(row.prof ?? "")}`)
    .replace(/"reg":\s*"[^"]*"/, `"reg": ${JSON.stringify(row.license_number ?? "")}`)
    .replace(/"g":\s*"[^"]*"/, `"g": ${JSON.stringify(row.supervising_agency ?? "")}`)
    .replace(/"lessons":\s*\d+/, `"lessons": ${row.lessons}`);
  if (row.certificate_fee != null) {
    next = next.replace(/"fee":\s*\d+/, `"fee": ${Number(row.certificate_fee)}`);
  }
  // 썸네일은 원본에 없던 항목이라 있으면 넣고, 지워졌으면 뺍니다.
  next = next.replace(/,\s*"thumb":\s*"[^"]*"/, "");
  if (row.thumbnail_url) {
    // 줄 끝은 `},` 또는 `}` 입니다. 닫는 중괄호 바로 앞에 끼워 넣습니다.
    next = next.replace(/\}(,?)\s*$/, `, "thumb": ${JSON.stringify(row.thumbnail_url)}}$1`);
  }
  for (const [from, to] of Object.entries(NAME_OVERRIDES)) {
    next = next.replace(`"n": ${JSON.stringify(from)}`, `"n": ${JSON.stringify(to)}`);
  }
  if (next !== line) updated++;
  return next;
});
fs.writeFileSync(DATA, out.join("\n"));

let refHits = 0;
for (const file of REF_FILES) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, "utf-8");
  const before = text;
  for (const [from, to] of Object.entries(NAME_OVERRIDES)) {
    text = text.split(from).join(to);
  }
  if (text !== before) {
    fs.writeFileSync(file, text);
    refHits++;
  }
}
console.log(`갱신 ${updated}건 / 제외 ${removed}건 / 이름 참조 치환 ${refHits}파일`);
