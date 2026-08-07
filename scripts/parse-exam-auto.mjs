/**
 * 예상문제 PDF → JSON (서식 자동 판별)
 *
 *   node scripts/parse-exam-auto.mjs <pdf경로> <출력경로>
 *
 * 원본 서식이 과정마다 제각각이라 파서가 두 벌 있습니다.
 *   - `parse-exam-pdf.mjs`   : "1." 처럼 문항 번호가 붙은 원본
 *   - `parse-exam-blocks.mjs`: 번호 없이 빈 줄로만 나뉜 원본
 * 어느 쪽이 맞는지는 열어보기 전엔 알 수 없어, 둘 다 돌려보고
 * **쓸 수 있는 문항(지문·보기·정답이 모두 성한 문항)이 많은 쪽**을 고릅니다.
 * 2단 조판일 수 있으므로 블록 파서는 1단/2단 추출을 모두 시도합니다.
 */
import { writeFileSync } from "node:fs";
import { basename } from "node:path";

import { parseExamText } from "./parse-exam-pdf.mjs";
import { parseExamBlocks, pdfToText } from "./parse-exam-blocks.mjs";

/** 등록 가능한 문항 수 — 이 값으로 파서를 고릅니다 */
export function usableCount(parsed) {
  return parsed.questions.filter(
    (q) => q.question?.trim() && q.answer !== null && q.choices.length >= 2 && q.answer <= q.choices.length,
  ).length;
}

/** 정답을 빼고 지문·보기만 성한 문항 수 — 정답이 없는 원본에서 파서를 고를 때 씁니다 */
export function structuredCount(parsed) {
  return parsed.questions.filter((q) => q.question?.trim() && q.choices.length >= 2).length;
}

export function parseBest(pdfPath) {
  const oneColumn = pdfToText(pdfPath, 1);
  const candidates = [
    { mode: "번호형", parsed: parseExamText(oneColumn) },
    { mode: "블록형", parsed: parseExamBlocks(oneColumn) },
  ];

  // 2단 조판은 그냥 뽑으면 두 단이 한 줄에 섞여 거의 못 읽습니다. 성적이 나쁠 때만 시도합니다.
  if (Math.max(...candidates.map((c) => usableCount(c.parsed))) < 10) {
    try {
      const twoColumn = pdfToText(pdfPath, 2);
      candidates.push({ mode: "블록형(2단)", parsed: parseExamBlocks(twoColumn) });
      candidates.push({ mode: "번호형(2단)", parsed: parseExamText(twoColumn) });
    } catch {
      /* pdfinfo 가 없으면 건너뜁니다 */
    }
  }

  // 원본에 정답 표기가 아예 없는 과정이 있습니다(정답표를 따로 받아 입힙니다).
  // 그럴 땐 어느 파서든 등록가능 수가 0~1이라 판별이 안 되므로,
  // 지문·보기가 성한 문항 수로 고릅니다. 정답을 나중에 입히면 그대로 쓸 수 있습니다.
  const noAnswers = Math.max(...candidates.map((c) => usableCount(c.parsed))) <= 1;
  const score = (c) => (noAnswers ? structuredCount(c.parsed) : usableCount(c.parsed));

  return candidates.reduce((best, c) => (score(c) > score(best) ? c : best));
}

/* ---------- CLI ---------- */
const [, , pdfPath, outPath] = process.argv;
if (pdfPath) {
  const { mode, parsed } = parseBest(pdfPath);
  writeFileSync(
    outPath ?? pdfPath.replace(/\.pdf$/i, ".json"),
    JSON.stringify(
      {
        출처: basename(pdfPath),
        파서: mode,
        exam: { name: basename(pdfPath).replace(/\.pdf$/i, ""), question_count: parsed.questions.length },
        warnings: parsed.warnings,
        questions: parsed.questions,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${mode} · ${parsed.questions.length}문항 / 등록가능 ${usableCount(parsed)}개 / 경고 ${parsed.warnings.length}건`);
}
