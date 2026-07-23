/**
 * R2에 올린 강의 영상을 lecture_sessions.video_url 에 연결하는 SQL을 생성합니다.
 *
 * 사용법:
 *   node scripts/link-video-urls.mjs            # 검증만(리포트 출력, SQL 생성)
 *   node scripts/link-video-urls.mjs --apply    # 위와 동일 + SQL 파일 경로 안내
 *
 * 출력: scripts/out/link-video-urls.sql  (Supabase SQL Editor 에 붙여넣어 실행)
 *
 * 규칙은 docs/video-mapping-rules.md 와 동일합니다.
 *  - 기본: 폴더의 영상 파일을 "파일명 속 마지막 숫자" 기준 오름차순 정렬 → 1차시부터 순서대로
 *  - 예외 과정: 아래 SPECIAL 에 사용할 파일/제외할 경로를 명시
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = "/Users/korhrd/Desktop/한직훈";
const BASE_URL = "https://pub-9a68f6a216c94dd887caa254f2dd4130.r2.dev";
const OUT_DIR = path.join(process.cwd(), "scripts", "out");

const nfc = (s) => s.normalize("NFC");

/** 로컬 폴더 → 과정코드 (74개, 전량 명시) */
const FOLDER_TO_CODE = {
  "AI프롬프트엔지니어": "CRS-KH-0075",
  "ESG경영평가사": "CRS-KH-0001",
  "SNS마케팅전문가": "CRS-KH-0003",
  "esg인증평가사": "CRS-KH-0002",
  "가족상담사_신규": "CRS-KH-0004",
  "간병사-김창혁": "CRS-KH-0005",
  "강아지산책전문가": "CRS-KH-0076",
  "교통안전지도사_김창혁": "CRS-KH-0077",
  "노인돌봄생활지원사_이영욱": "CRS-KH-0007",
  "노인심리상담사_신규": "CRS-KH-0008",
  "다문화가정복지상담사_신규": "CRS-KH-0009",
  "데이터라벨러": "CRS-KH-0010",
  "도시농업전문가": "CRS-KH-0011",
  "독서논술지도사-임미영": "CRS-KH-0012",
  "독서심리상담사_신규": "CRS-KH-0013",
  "독서지도사_신규": "CRS-KH-0014",
  "동물병원코디네이터": "CRS-KH-0078",
  "동화구연지도사_신규": "CRS-KH-0015",
  "등하원보호사": "CRS-KH-0079",
  "디지털리터러시-7최낙조": "CRS-KH-0016",
  "디지털중독예방": "CRS-KH-0017",
  "디지털튜터_김창혁": "CRS-KH-0080",
  "마케팅기획전문가-강희수": "CRS-KH-0018",
  "메이크업": "CRS-KH-0019",
  "명리심리상담사": "CRS-KH-0020",
  "미술심리상담사_최신": "CRS-KH-0021",
  "바리스타_24강": "CRS-KH-0022",
  "반려동물관리사": "CRS-KH-0023",
  "반려동물행동상담지도사": "CRS-KH-0024",
  "방과후돌봄교실지도사": "CRS-KH-0025",
  "방과후아동지도사_이유영": "CRS-KH-0027",
  "방과후지도사_신규": "CRS-KH-0028",
  "방역관리사_최철규": "CRS-KH-0029",
  "베이비시터_김창혁": "CRS-KH-0030",
  "병원코디네이터_천상욱": "CRS-KH-0033",
  "보험심사관리사": "CRS-KH-0081",
  "부동산권리분석사": "CRS-KH-0034",
  "부모교육상담사_신규": "CRS-KH-0035",
  "산모신생아건강관리사": "CRS-KH-0036",
  "생활지원사": "CRS-KH-0038",
  "세차관리사": "CRS-KH-0082",
  "손유희지도사_신규": "CRS-KH-0039",
  "시니어&실버인지활동지도사": "CRS-KH-0041",
  "실버보드게임지도사_정민영": "CRS-KH-0040",
  "실버케어지도사-전유림": "CRS-KH-0042",
  "심리상담사_신규": "CRS-KH-0044",
  "아동공예지도자": "CRS-KH-0045",
  "아동미술심리상담사": "CRS-KH-0046",
  "아동미술지도사": "CRS-KH-0047",
  "아동심리상담사": "CRS-KH-0048",
  "안전관리사_이민태": "CRS-KH-0072",
  "영농형태양광전문가": "CRS-KH-0050",
  "운동처방전문가_김창혁": "CRS-KH-0051",
  "유투브크리에이터": "CRS-KH-0052",
  "유품정리사": "CRS-KH-0083",
  "은퇴설계전문가": "CRS-KH-0053",
  "음악심리상담사": "CRS-KH-0084",
  "인형극공연지도사": "CRS-KH-0054",
  "자기주도학습지도사_신규": "CRS-KH-0055",
  "자원봉사지도사": "CRS-KH-0056",
  "자원순환관리사": "CRS-KH-0057",
  "정원관리사": "CRS-KH-0058",
  "조향사_김창혁": "CRS-KH-0059",
  "종이접기지도사": "CRS-KH-0060",
  "지역아동교육지도사": "CRS-KH-0061",
  "진로적성상담사-111": "CRS-KH-0062",
  "집합건물관리사": "CRS-KH-0063",
  "치과병원코디네이터": "CRS-KH-0085",
  "클레이아트": "CRS-KH-0073",
  "타로심리상담사": "CRS-KH-0066",
  "학교안전지도사": "CRS-KH-0068",
  "학교폭력예방상담사": "CRS-KH-0069",
  "헤어미용": "CRS-KH-0070",
  "환경관리전문가": "CRS-KH-0071",
};

/**
 * 중복본·원본·작업본이 섞인 과정의 파일 선택 규칙
 *  onlyTop  : 폴더 최상위 파일만 사용 (하위 폴더 무시)
 *  include  : 파일명이 이 정규식과 맞는 것만 사용
 *  subdir   : 이 하위 경로 안의 파일만 사용
 */
const SPECIAL = {
  "방과후지도사_신규": { include: /^b_school_\d+\.mp4$/i },
  "운동처방전문가_김창혁": { subdir: "강의영상", include: /^exercise_\d+\.mp4$/i },
  "영농형태양광전문가": { onlyTop: true },
  "인형극공연지도사": { onlyTop: true },
  // 아래 3개는 루트와 하위폴더에 영상이 나뉘어 있습니다. 하위폴더가 작업본/원본으로
  // 보여 루트만 사용합니다. DB 차시 수가 더 많으므로(전체 개수로 만들어 둠) 남는 차시는
  // 빈 채로 남습니다 — 복귀 후 확인 필요. (docs/video-mapping-rules.md 참고)
  "AI프롬프트엔지니어": { onlyTop: true },   // 루트 18 / 하위 'AI프롬프트 엔지니어링 전문가' 17
  "유품정리사": { onlyTop: true },           // 루트 21 / '유품정리사인트로전' 19, '유품 1~10강' 1
  "음악심리상담사": { onlyTop: true },       // 루트 20 / '자료/음악작업/1~6강' 6 (작업본)
};

const VIDEO_RE = /\.(mp4|mov)$/i;

/**
 * 파일명에서 차시 번호를 뽑습니다.
 *  1) 'N강-...' / 'N차시...' 처럼 번호가 앞에 오면 그 숫자 (제목에 숫자가 섞여도 안전)
 *  2) 그 외에는 마지막 숫자 그룹 (fem_01, s10_l48, 1급-24강 등)
 */
function orderKey(fileName) {
  const name = nfc(fileName).replace(VIDEO_RE, "");
  const lead = name.match(/^\s*(\d+)\s*(강|차시)/);
  if (lead) return parseInt(lead[1], 10);
  const nums = name.match(/\d+/g);
  return nums ? parseInt(nums[nums.length - 1], 10) : Number.MAX_SAFE_INTEGER;
}

function listVideos(folder) {
  const rule = SPECIAL[folder] ?? {};
  const base = rule.subdir ? path.join(ROOT, folder, rule.subdir) : path.join(ROOT, folder);
  if (!fs.existsSync(base)) return [];

  const out = [];
  const walk = (dir, depth) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) {
        // onlyTop / subdir+include 인 경우 하위 폴더로 내려가지 않음
        if (rule.onlyTop || rule.subdir) continue;
        walk(abs, depth + 1);
      } else if (VIDEO_RE.test(e.name)) {
        if (rule.include && !rule.include.test(nfc(e.name))) continue;
        out.push(path.relative(path.join(ROOT, folder), abs));
      }
    }
  };
  walk(base, 0);

  return out
    .map((rel) => nfc(rel))
    .sort((a, b) => orderKey(path.basename(a)) - orderKey(path.basename(b)) || a.localeCompare(b));
}

/** R2 객체 키(=로컬 상대경로)를 URL 로 인코딩 */
function toUrl(folder, relPath) {
  const segments = [folder, ...relPath.split(path.sep)].map((s) => encodeURIComponent(nfc(s)));
  return `${BASE_URL}/${segments.join("/")}`;
}

const dbCourses = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "scripts", "db-courses.json"), "utf8"),
);
const dbByCode = new Map(dbCourses.map((c) => [c.code, c]));

const sqlLines = [];
const report = [];

for (const [folder, code] of Object.entries(FOLDER_TO_CODE)) {
  const files = listVideos(folder);
  const db = dbByCode.get(code);
  const dbCount = db ? db.session_count : 0;

  report.push({
    folder,
    code,
    dbName: db ? db.name : "(DB 없음)",
    files: files.length,
    sessions: dbCount,
    diff: files.length - dbCount,
  });

  files.forEach((rel, idx) => {
    const order = idx + 1;
    if (order > dbCount) return; // 차시보다 영상이 많으면 초과분은 연결하지 않음
    const url = toUrl(folder, rel).replace(/'/g, "''");
    sqlLines.push(
      `UPDATE lecture_sessions ls SET video_url='${url}', video_source='external', updated_at=now() ` +
        `FROM course_lectures cl JOIN courses c ON c.id=cl.course_id ` +
        `WHERE ls.lecture_id=cl.id AND c.code='${code}' AND ls.session_order=${order} AND ls.deleted_at IS NULL;`,
    );
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const sqlPath = path.join(OUT_DIR, "link-video-urls.sql");
fs.writeFileSync(
  sqlPath,
  ["BEGIN;", ...sqlLines, "COMMIT;", ""].join("\n"),
  "utf8",
);

// ---------- 리포트 ----------
const totalFiles = report.reduce((s, r) => s + r.files, 0);
const mismatch = report.filter((r) => r.diff !== 0);

console.log(`\n과정 ${report.length}개 / 연결 대상 영상 ${totalFiles}개`);
console.log(`생성된 UPDATE 문: ${sqlLines.length}개`);
console.log(`SQL 파일: ${sqlPath}`);

if (mismatch.length) {
  console.log(`\n[영상 수 ≠ DB 차시 수 — ${mismatch.length}건]`);
  mismatch
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .forEach((r) =>
      console.log(
        `  · ${r.folder} → ${r.code} ${r.dbName} : 영상 ${r.files} vs 차시 ${r.sessions} (${r.diff > 0 ? "+" : ""}${r.diff})`,
      ),
    );
  console.log(`  ※ 영상이 더 많으면 초과분은 연결하지 않고, 부족하면 뒤쪽 차시는 빈 채로 남습니다.`);
} else {
  console.log(`\n모든 과정의 영상 수가 DB 차시 수와 일치합니다.`);
}
