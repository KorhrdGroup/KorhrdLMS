/**
 * 파싱 결과에 정답 키를 입힙니다.
 *
 *   node scripts/apply-answer-key.mjs <parsed.json> <answer-key.json>
 *
 * 원본에 정답 표기가 아예 없거나(유튜브크리에이터), 정답표가 본문과 어긋나
 * 자동으로는 못 붙이는 과정이 있습니다. 그런 과정만 `scripts/data/answer-keys/`
 * 에 정답 배열을 손으로 만들어 두고 이 스크립트로 입힙니다.
 *
 * 안전장치: **문항 수와 정답 수가 정확히 같을 때만** 입힙니다.
 * 하나만 어긋나도 전 문항이 오답이 되기 때문입니다.
 * 대응이 없는 문항은 키에 `null` 을 넣어 자리를 맞춥니다(등록에서 빠집니다).
 */
import { readFileSync, writeFileSync } from "node:fs";

const [, , parsedPath, keyPath] = process.argv;
if (!parsedPath || !keyPath) {
  console.error("사용법: node scripts/apply-answer-key.mjs <parsed.json> <answer-key.json>");
  process.exit(1);
}

const parsed = JSON.parse(readFileSync(parsedPath, "utf8"));
const key = JSON.parse(readFileSync(keyPath, "utf8"));

/**
 * 부분 수정 모드 — 원본이 깨진 문항만 골라 고칩니다.
 * 순서가 중요합니다: 지문 → 보기 → 정답 → 삭제.
 * 삭제를 마지막에 해야 번호가 어긋나지 않습니다.
 *
 *   stems   { "36": "지문..." }        지문이 표지·머리글에 섞여 안 읽힌 문항
 *   choices { "40": ["...", ...] }     2단 조판·오타로 보기가 뭉개진 문항
 *   patches { "46": "1", "43": "1,3" } 원본 정답표에 그 번호만 비어 있는 경우
 *   drop    [101]                      문항이 아닌 것(정답표 머리글, 빈 껍데기)
 */
const partial = key.stems || key.choices || key.patches || key.drop;

if (key.stems) {
  for (const [no, question] of Object.entries(key.stems)) {
    const target = parsed.questions[Number(no) - 1];
    if (!target) { console.error(`${no}번 문항이 없습니다 — 건너뜁니다.`); continue; }
    target.question = question;
  }
  console.log(`${Object.keys(key.stems).length}개 문항 지문을 채웠습니다.`);
}

if (key.choices) {
  for (const [no, choices] of Object.entries(key.choices)) {
    const target = parsed.questions[Number(no) - 1];
    if (!target) { console.error(`${no}번 문항이 없습니다 — 건너뜁니다.`); continue; }
    target.choices = choices;
  }
  console.log(`${Object.keys(key.choices).length}개 문항 보기를 교체했습니다.`);
}

if (key.patches) {
  let done = 0;
  for (const [no, answer] of Object.entries(key.patches)) {
    const target = parsed.questions[Number(no) - 1];
    if (!target) { console.error(`${no}번 문항이 없습니다 — 건너뜁니다.`); continue; }
    target.answer = answer;
    done += 1;
  }
  parsed.정답출처 = [parsed.정답출처, key.출처].filter(Boolean).join(" / ");
  console.log(`${done}개 문항 정답을 채웠습니다.`);
}

if (key.drop) {
  const drop = new Set(key.drop.map(Number));
  parsed.questions = parsed.questions
    .filter((_, i) => !drop.has(i + 1))
    .map((q, i) => ({ ...q, no: i + 1 }));
  if (parsed.exam) parsed.exam.question_count = parsed.questions.length;
  console.log(`${drop.size}개 문항을 지웠습니다 → 남은 ${parsed.questions.length}문항`);
}

if (partial) {
  writeFileSync(parsedPath, `${JSON.stringify(parsed, null, 2)}\n`);
  process.exit(0);
}

const answers = key.answers ?? key;

if (parsed.questions.length !== answers.length) {
  console.error(
    `문항 수(${parsed.questions.length})와 정답 수(${answers.length})가 다릅니다 — 입히지 않았습니다.`,
  );
  process.exit(1);
}

parsed.questions.forEach((question, i) => {
  question.answer = answers[i] ?? null;
});
parsed.정답출처 = key.출처 ?? keyPath;
parsed.warnings = (parsed.warnings ?? []).filter((w) => !w.includes("정답"));

writeFileSync(parsedPath, `${JSON.stringify(parsed, null, 2)}\n`);
const filled = parsed.questions.filter((q) => q.answer !== null).length;
console.log(`${parsed.questions.length}문항 중 ${filled}개에 정답을 입혔습니다.`);
