/**
 * courses.professor_name(레거시 텍스트)을 professor_id 조인 이름과 맞춥니다.
 *
 * 학생 수강신청 카드는 professor_name을, 과정 상세페이지는 professor_id 조인을 읽습니다.
 * 두 값이 어긋나면 같은 과정에서 담당교수가 다르게 보입니다
 * (클레이아트지도사가 카드엔 "성은하 교수", 상세엔 "정진숙 교수"로 나오던 문제).
 *
 * professor_id 가 정본입니다 — professor_name 은 이관이 끝나면 지울 컬럼입니다.
 *
 * 사용법:
 *   node --env-file=.env.local scripts/sync-course-professor-name.mjs --dry-run
 *   node --env-file=.env.local scripts/sync-course-professor-name.mjs
 */
import pg from "pg";

const dryRun = process.argv.includes("--dry-run");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `SELECT c.id, c.code, c.name, c.professor_name, p.name AS linked_name
     FROM public.courses c
     JOIN public.professors p ON p.id = c.professor_id
    WHERE c.deleted_at IS NULL
      AND c.professor_name IS DISTINCT FROM p.name
    ORDER BY c.code`,
);

if (rows.length === 0) {
  console.log("불일치 없음.");
  await client.end();
  process.exit(0);
}

for (const r of rows) {
  console.log(`${r.code} ${r.name}: ${r.professor_name ?? "(비어있음)"} → ${r.linked_name}`);
}
console.log(`\n총 ${rows.length}건`);

if (dryRun) {
  console.log("--dry-run 이라 저장하지 않았습니다.");
  await client.end();
  process.exit(0);
}

const { rowCount } = await client.query(
  `UPDATE public.courses c
      SET professor_name = p.name
     FROM public.professors p
    WHERE p.id = c.professor_id
      AND c.deleted_at IS NULL
      AND c.professor_name IS DISTINCT FROM p.name`,
);
console.log(`\n${rowCount}건 갱신 완료`);
await client.end();
