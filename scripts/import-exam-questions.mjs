/**
 * 시험/기출문제 JSON → Supabase 등록
 *
 *   node --env-file=.env.local scripts/import-exam-questions.mjs <json경로> <과정코드> [--practice]
 *
 *   예) 채점되는 수료시험으로 등록
 *       node --env-file=.env.local scripts/import-exam-questions.mjs \
 *         scripts/data/생활지원사_수료시험_20문항.json CRS-KH-0007
 *
 *   예) 연습용 기출문제로 등록(강의실 "기출문제 풀기"에 노출)
 *       node --env-file=.env.local scripts/import-exam-questions.mjs \
 *         scripts/data/생활지원사_예상문제.json CRS-KH-0007 --practice
 *
 * 같은 이름의 시험이 이미 있으면 문항을 지우고 다시 넣습니다(중복 방지).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const [, , jsonPath, courseCode, ...flags] = process.argv;
const isPractice = flags.includes("--practice");

if (!jsonPath || !courseCode) {
  console.error("사용법: node --env-file=.env.local scripts/import-exam-questions.mjs <json> <과정코드> [--practice]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("환경변수 NEXT_PUBLIC_SUPABASE_URL / KEY 가 필요합니다.");
  process.exit(1);
}

const supabase = createClient(url, key);
const data = JSON.parse(readFileSync(jsonPath, "utf8"));

/** 예상문제 전체 파일(questions)과 시험 파일(exam_questions) 둘 다 받습니다. */
function toRows() {
  if (Array.isArray(data.exam_questions)) {
    return data.exam_questions.map((q, i) => ({
      question_type: q.question_type ?? "multiple_choice",
      question: q.question,
      choice1: q.choice1 ?? null,
      choice2: q.choice2 ?? null,
      choice3: q.choice3 ?? null,
      choice4: q.choice4 ?? null,
      choice5: q.choice5 ?? null,
      answer: String(q.answer),
      score: q.score ?? 5,
      sort_order: q.sort_order ?? i + 1,
    }));
  }

  const perScore = isPractice ? 0 : 5;
  return data.questions.map((q, i) => ({
    question_type: "multiple_choice",
    question: q.question,
    choice1: q.choices[0] ?? null,
    choice2: q.choices[1] ?? null,
    choice3: q.choices[2] ?? null,
    choice4: q.choices[3] ?? null,
    choice5: q.choices[4] ?? null,
    answer: String(q.answer),
    score: perScore,
    sort_order: i + 1,
  }));
}

const rows = toRows();
const examName = data.exam?.name ?? (isPractice ? "기출문제" : "수료시험");

const { data: course, error: courseError } = await supabase
  .from("courses")
  .select("id, name")
  .eq("code", courseCode)
  .is("deleted_at", null)
  .maybeSingle();

if (courseError) throw courseError;
if (!course) {
  console.error(`과정코드 ${courseCode} 를 찾을 수 없습니다.`);
  process.exit(1);
}

// 같은 이름의 시험이 있으면 재사용하고 문항만 갈아끼웁니다.
const { data: existing } = await supabase
  .from("exams")
  .select("id")
  .eq("course_id", course.id)
  .eq("name", examName)
  .is("deleted_at", null)
  .maybeSingle();

let examId = existing?.id;

const examPayload = {
  course_id: course.id,
  year: new Date().getFullYear(),
  name: examName,
  exam_kind: isPractice ? "mock" : (data.exam?.exam_kind ?? "final_exam"),
  exam_type: isPractice ? "practice" : "regular",
  question_count: rows.length,
  exam_duration_minutes: data.exam?.exam_duration_minutes ?? 60,
  pass_score: isPractice ? null : (data.exam?.pass_score ?? 60),
  // 기출문제는 채점 대상이 아니므로 공개 여부와 무관하게 목록에서 걸러집니다.
  is_published: isPractice ? false : (data.exam?.is_published ?? true),
  status: "confirmed",
};

if (examId) {
  const { error } = await supabase.from("exams").update(examPayload).eq("id", examId);
  if (error) throw error;
  await supabase.from("exam_questions").delete().eq("exam_id", examId);
  console.log(`기존 시험 갱신: ${examName}`);
} else {
  const { data: created, error } = await supabase
    .from("exams")
    .insert(examPayload)
    .select("id")
    .single();
  if (error) throw error;
  examId = created.id;
  console.log(`새 시험 생성: ${examName}`);
}

const { error: insertError } = await supabase
  .from("exam_questions")
  .insert(rows.map((row) => ({ ...row, exam_id: examId })));
if (insertError) throw insertError;

console.log(`과정   : ${course.name} (${courseCode})`);
console.log(`유형   : ${isPractice ? "기출문제(연습용)" : "수료시험(채점)"}`);
console.log(`문항수 : ${rows.length}`);
console.log(`총점   : ${rows.reduce((sum, r) => sum + r.score, 0)}점`);
