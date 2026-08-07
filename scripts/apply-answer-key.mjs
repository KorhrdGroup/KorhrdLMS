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
