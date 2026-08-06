/**
 * 파싱한 예상문제 JSON 묶음 → 기출문제(연습용)로 일괄 등록
 *
 *   node --env-file=.env.local scripts/import-parsed-exams.mjs [--dry]
 *
 * scripts/data/parsed/*.json 을 읽어 과정명을 DB courses 와 맞춘 뒤,
 * `exam_type='practice'` 시험 한 건과 문항을 넣습니다.
 *
 * **정답이 있는 문항만** 넣습니다. 기출문제 화면은 "정답 보기"가 핵심이라
 * 정답 없는 문항은 쓸모가 없기 때문입니다.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";
import { basename } from "node:path";

const DRY = process.argv.includes("--dry");
const DIR = "scripts/data/parsed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

/** 폴더명(파일명)과 DB 과정명을 맞추기 위한 정규화 — 급수·구분자·공백 제거 */
const norm = (s) =>
  s
    .normalize("NFC")
    .replace(/\.json$/i, "")
    .replace(/[\s_\-&[\]()]/g, "")
    .replace(/\d*급$/, "")
    .replace(/(신규|최신|최종|참고|예상문제|기출문제|전문가과정)/g, "")
    .toLowerCase();

/** 자동 매칭이 어려운 것들은 직접 지정합니다 */
const MANUAL = {
  "간병사-김창혁": "CRS-KH-0005",
  "독서논술지도사-임미영": "CRS-KH-0012",
  "디지털중독예방": "CRS-KH-0017",
  "미술심리상담사_최신": "CRS-KH-0021",
  "반려동물관리사": "CRS-KH-0023",
  "방과후지도사_신규": "CRS-KH-0028",
  "시니어_실버인지활동지도사": "CRS-KH-0041",
  "아동심리상담사": "CRS-KH-0048",
  "영농형태양광전문가": "CRS-KH-0050",
  "AI프롬프트엔지니어": "CRS-KH-0075",
};

const { data: courseRows } = await supabase
  .from("courses")
  .select("id, code, name")
  .is("deleted_at", null)
  .eq("status", "active");

const byNorm = new Map(courseRows.map((c) => [norm(c.name), c]));
const byCode = new Map(courseRows.map((c) => [c.code, c]));

const report = [];

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json")).sort()) {
  const label = basename(file, ".json");
  const data = JSON.parse(readFileSync(`${DIR}/${file}`, "utf8"));

  const usable = data.questions.filter(
    (q) => q.answer !== null && q.answer <= q.choices.length && q.choices.length >= 2 && q.question.trim(),
  );

  const course = MANUAL[label] ? byCode.get(MANUAL[label]) : byNorm.get(norm(label));

  if (!course) {
    report.push({ label, status: "과정매칭실패", total: data.questions.length, usable: usable.length });
    continue;
  }
  if (usable.length === 0) {
    report.push({ label, code: course.code, status: "쓸수있는문항없음", total: data.questions.length, usable: 0 });
    continue;
  }

  if (DRY) {
    report.push({ label, code: course.code, course: course.name, status: "등록예정", total: data.questions.length, usable: usable.length });
    continue;
  }

  const examName = `${course.name} 기출문제`;
  const { data: existing } = await supabase
    .from("exams")
    .select("id")
    .eq("course_id", course.id)
    .eq("name", examName)
    .is("deleted_at", null)
    .maybeSingle();

  const payload = {
    course_id: course.id,
    year: new Date().getFullYear(),
    name: examName,
    exam_kind: "mock",
    exam_type: "practice",
    question_count: usable.length,
    exam_duration_minutes: 60,
    pass_score: null,
    is_published: false,
    status: "confirmed",
  };

  let examId = existing?.id;
  if (examId) {
    await supabase.from("exams").update(payload).eq("id", examId);
    await supabase.from("exam_questions").delete().eq("exam_id", examId);
  } else {
    const { data: created, error } = await supabase.from("exams").insert(payload).select("id").single();
    if (error) {
      report.push({ label, code: course.code, status: `실패: ${error.message}`, total: data.questions.length, usable: usable.length });
      continue;
    }
    examId = created.id;
  }

  const rows = usable.map((q, i) => ({
    exam_id: examId,
    question_type: "multiple_choice",
    question: q.question,
    choice1: q.choices[0] ?? null,
    choice2: q.choices[1] ?? null,
    choice3: q.choices[2] ?? null,
    choice4: q.choices[3] ?? null,
    choice5: q.choices[4] ?? null,
    answer: String(q.answer),
    score: 0,
    sort_order: i + 1,
  }));

  const { error: insertError } = await supabase.from("exam_questions").insert(rows);
  report.push({
    label,
    code: course.code,
    course: course.name,
    status: insertError ? `실패: ${insertError.message}` : "등록완료",
    total: data.questions.length,
    usable: usable.length,
  });
}

console.log(JSON.stringify(report, null, 1));
