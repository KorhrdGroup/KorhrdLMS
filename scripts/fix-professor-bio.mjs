/**
 * 한 덩어리로 뭉쳐 들어간 교수 약력을 항목별로 쪼개 professors.bio 에 다시 넣습니다.
 *
 * 원본 과정 데이터에는 약력이 이미 평문으로 합쳐진 채 들어와서, 줄 단위 복원이
 * 기계적으로는 불가능합니다(course-detail.service.ts 주석 참고).
 * 그래서 `ㆍ`(또는 ·, •, -, 줄바꿈)로 구분된 원본 텍스트를 직접 받아 나눕니다.
 *
 * 상세페이지는 `[ 소속 ]` / `[ 학력 ... ]` 라벨로 두 칸을 나누므로, 각 묶음의
 * 첫 줄에만 라벨을 남기고 나머지는 라벨 없이 이어붙입니다.
 *
 * 사용법:
 *   pbpaste | node --env-file=.env.local scripts/fix-professor-bio.mjs "권지선 교수"
 *   node --env-file=.env.local scripts/fix-professor-bio.mjs "권지선 교수" --dry-run < bio.txt
 */
import pg from "pg";

const [, , rawName, ...flags] = process.argv;
const dryRun = flags.includes("--dry-run");

if (!rawName) {
  console.error('사용법: pbpaste | node --env-file=.env.local scripts/fix-professor-bio.mjs "권지선 교수"');
  process.exit(1);
}

const professorName = rawName.normalize("NFC");

/**
 * 붙여넣은 약력 텍스트를 항목 배열로 나눕니다.
 *
 * `[ 학력 및 전공 ]` 처럼 대괄호만 있는 줄은 그 아래 항목들이 들어갈 칸을 지정합니다.
 * 라벨이 하나도 없으면 전부 `[ 소속 ]`(상세페이지 기본 칸)으로 갑니다.
 */
function parseBullets(text) {
  const bareName = professorName.replace(/\s*교수$/, "");
  const nameLine = new RegExp(`^${bareName}\\s*교수(님)?$`);

  const lines = text
    .normalize("NFC")
    // 불릿 문자를 줄바꿈으로 통일합니다. 단, 라벨 줄은 그대로 둡니다.
    .replace(/[ㆍ·•‧∙]/g, "\n")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    // 이름 줄("권지선 교수님")과 빈 줄, 장식용 별표를 걸러냅니다.
    .filter((line) => line && line !== "*" && !nameLine.test(line));

  /** [{ label, items }] — 입력 순서를 유지합니다. */
  const groups = [];
  for (const line of lines) {
    const labelOnly = /^\[\s*([^\]]+?)\s*\]$/.exec(line);
    if (labelOnly) {
      groups.push({ label: `[ ${labelOnly[1]} ]`, items: [] });
      continue;
    }
    if (groups.length === 0) groups.push({ label: null, items: [] });
    groups[groups.length - 1].items.push(line);
  }
  return groups.filter((g) => g.items.length > 0);
}

const stdin = await new Promise((resolve) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (buf += chunk));
  process.stdin.on("end", () => resolve(buf));
});

const groups = parseBullets(stdin);
if (groups.length === 0) {
  console.error("표준입력에서 약력 항목을 찾지 못했습니다. ㆍ 로 구분된 텍스트를 넣어주세요.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `SELECT id, name, bio FROM public.professors WHERE name = $1 AND deleted_at IS NULL`,
  [professorName],
);
if (rows.length !== 1) {
  console.error(`"${professorName}" 조회 결과가 ${rows.length}건입니다.`);
  await client.end();
  process.exit(1);
}

const professor = rows[0];
// 입력에 라벨이 없으면 기존 첫 줄의 라벨을 물려받고, 그것도 없으면 기본 칸인 "소속"으로 둡니다.
const fallbackLabel = (professor.bio ?? [])[0]?.match(/^\[\s*[^\]]+\s*\]/)?.[0] ?? "[ 소속 ]";

/** 기존 bio를 라벨 단위 묶음으로 되읽습니다. 라벨 없는 줄은 바로 위 묶음에 붙습니다. */
function readExistingGroups(bio) {
  const out = [];
  for (const line of bio ?? []) {
    const matched = /^\[\s*([^\]]+?)\s*\]\s*(.*)$/.exec(line);
    // 대괄호가 라벨이 아니라 저서 제목인 줄이 있습니다
    // (`[선영학 참교육학(개론) …] - 한림당`). 라벨은 짧다는 점으로 가릅니다.
    const isLabel = matched && matched[1].length <= 12;
    if (isLabel) {
      out.push({ label: `[ ${matched[1]} ]`, items: matched[2] ? [matched[2]] : [] });
      continue;
    }
    if (out.length === 0) out.push({ label: null, items: [] });
    out[out.length - 1].items.push(line);
  }
  return out;
}

const suppliedLabels = new Set(groups.map((g) => g.label ?? fallbackLabel));
// 이번에 안 준 칸은 지우지 않고 그대로 둡니다 — 예전에 학력/저서를 통째로 날린 적이 있습니다.
const kept = readExistingGroups(professor.bio).filter(
  (g) => g.items.length > 0 && !suppliedLabels.has(g.label ?? fallbackLabel),
);
if (kept.length > 0) {
  console.log(`유지되는 기존 칸: ${kept.map((g) => g.label ?? "(라벨 없음)").join(", ")}`);
}

const nextBio = [...groups, ...kept].flatMap(({ label, items }) =>
  // 각 묶음의 첫 줄에만 라벨을 답니다 — 라벨 없는 줄은 바로 위 칸에 이어집니다.
  items.map((line, i) => (i === 0 ? `${label ?? fallbackLabel} ${line}` : line)),
);

console.log(`교수: ${professor.name} (${professor.id})`);
console.log(`\n--- 기존 (${professor.bio?.length ?? 0}줄)`);
(professor.bio ?? []).forEach((l, i) => console.log(`  [${i}] ${l}`));
console.log(`\n--- 변경 (${nextBio.length}줄)`);
nextBio.forEach((l, i) => console.log(`  [${i}] ${l}`));

if (dryRun) {
  console.log("\n--dry-run 이라 저장하지 않았습니다.");
  await client.end();
  process.exit(0);
}

await client.query(`UPDATE public.professors SET bio = $1 WHERE id = $2`, [nextBio, professor.id]);
console.log("\nprofessors.bio 갱신 완료");
await client.end();
