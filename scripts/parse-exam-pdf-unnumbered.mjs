/**
 * 예상문제 PDF → JSON (문항 번호가 없는 형식 전용)
 *
 *   node scripts/parse-exam-pdf-unnumbered.mjs <pdf경로> [출력경로]
 *
 * 기존 parse-exam-pdf.mjs 는 "1." "문제1" 같은 **번호**로 문항을 나눕니다.
 * 2026-08-12 본사에서 받은 4개 과정(네일아트·독서심리·방과후수학·지역아동교육)은
 * 번호가 아예 없어 그 파서가 0문항을 내놓습니다.
 *
 * **경계는 "①" 로 잡습니다.** 문항 번호가 없어도 보기의 첫 항목은 반드시 ①(또는 "1.")
 * 이라, 그 위치를 문항 시작점으로 삼고 앞뒤를 나눕니다.
 *
 *   [ 지문 ] ① … ② … ③ … ④ … (⑤ …)   [ 지문 ] ① …
 *            ↑ 여기가 경계                       ↑ 다음 경계
 *
 * 보기가 두 줄로 접히거나(“…알아볼 수 있 / 다.”) 쪽이 바뀌어도 같은 보기로 잇고,
 * 보기 블록이 끝난 뒤의 텍스트는 **다음 문항의 지문**으로 넘깁니다.
 *
 *   정답 :  ① 지문 끝의 "( 3 )"  ② 보기 뒤의 "정답: 3"(해설 줄 포함)
 *           ③ 마지막 쪽 정답표
 *
 * 출력 형식은 parse-exam-pdf.mjs 와 같아 import-parsed-exams.mjs 로 바로 넣을 수 있습니다.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { basename } from "node:path";

const CIRCLES = ["①", "②", "③", "④", "⑤"];
const circleIndex = (ch) => CIRCLES.indexOf(ch);
const isCircleStart = (l) => /^[①②③④⑤]/.test(l);
const isNumChoiceStart = (l) => /^[1-5]\.\s*\S/.test(l);

/** 머리말·쪽번호처럼 문제와 무관한 줄 */
const isNoise = (line) =>
  !line ||
  /^\d{1,3}$/.test(line) ||
  /^※/.test(line) ||
  /예상\s*문\s*제$/.test(line) ||
  /답안지는 마지막 페이지/.test(line) ||
  /학습 내용 복습과 시험 대비/.test(line) ||
  /선별된 문제들로 구성/.test(line);

/** 정답·해설 안내 줄 (지문으로 새면 안 됩니다) */
const ANSWER_LINE = /(?:^|\s)(?:✅\s*)?정답\s*[:：]\s*([1-5])/;
const EXPLAIN_LINE = /^\s*(?:✅\s*)?(?:해설|풀이)\s*[:：]/;

export function parseUnnumbered(text) {
  const warnings = [];
  const lines = text.split("\n").map((l) => l.replace(/\f/g, " ").trim());

  /* ---------- 1) 마지막 쪽 정답표 (번호 줄 / 답 줄이 번갈아) ---------- */
  const answerTable = new Map();
  for (let i = 0; i < lines.length - 1; i += 1) {
    const nums = lines[i].split(/\s+/).filter(Boolean);
    const ans = lines[i + 1].split(/\s+/).filter(Boolean);
    const allNum = (arr) => arr.length >= 3 && arr.every((v) => /^\d{1,3}$/.test(v));
    if (!allNum(nums) || !allNum(ans) || nums.length !== ans.length) continue;
    if (!nums.every((v, k) => k === 0 || Number(v) > Number(nums[k - 1]))) continue;
    if (!ans.every((v) => Number(v) >= 1 && Number(v) <= 5)) continue;
    nums.forEach((n, k) => answerTable.set(Number(n), Number(ans[k])));
    i += 1;
  }

  /* ---------- 2) 문항 시작점(첫 보기) 찾기 ---------- */
  const starts = [];
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    if (isCircleStart(l) && circleIndex(l[0]) === 0) starts.push(i);
    else if (/^1\.\s*\S/.test(l)) starts.push(i);
  }

  /* ---------- 3) 문항별로 [보기 블록] + [다음 지문] 나누기 ---------- */
  const questions = [];

  for (let s = 0; s < starts.length; s += 1) {
    const from = starts[s];
    const to = s + 1 < starts.length ? starts[s + 1] : lines.length;

    /* 3-1) 보기 블록 — 순번이 어긋나거나 빈 줄 뒤 텍스트가 오면 종료 */
    const choices = [];
    let inlineAnswer = null;
    let cursor = from;
    let lastFilled = -1;
    let blankRun = 0;

    while (cursor < to) {
      const cur = lines[cursor];

      if (isCircleStart(cur)) {
        // 2단 배치("① 가나   ② 다라")는 둘로 나눕니다
        const parts = cur.split(/(?=[①②③④⑤])/).filter(Boolean);
        let ok = false;
        for (const p of parts) {
          const idx = circleIndex(p[0]);
          if (idx === -1) continue;
          // 순번이 역행하면 다음 문항이 시작된 것으로 봅니다
          if (idx <= lastFilled) { ok = false; break; }
          choices[idx] = p.slice(1).trim();
          lastFilled = idx;
          ok = true;
        }
        if (!ok) break;
        blankRun = 0;
        cursor += 1;
        continue;
      }

      if (isNumChoiceStart(cur)) {
        const idx = Number(cur[0]) - 1;
        if (idx <= lastFilled) break;
        choices[idx] = cur.slice(2).trim().replace(/^\.\s*/, "");
        lastFilled = idx;
        blankRun = 0;
        cursor += 1;
        continue;
      }

      /* 정답·해설 줄이 나오면 보기 블록은 끝난 것입니다.
         (해설 바로 다음 줄에 빈 줄 없이 다음 지문이 붙는 PDF가 있습니다) */
      const ans = cur.match(ANSWER_LINE);
      if (ans) {
        inlineAnswer = Number(ans[1]);
        blankRun = 1;
        cursor += 1;
        continue;
      }
      if (EXPLAIN_LINE.test(cur)) {
        blankRun = 1;
        cursor += 1;
        continue;
      }

      if (isNoise(cur)) {
        blankRun += 1;
        cursor += 1;
        continue;
      }

      /* 일반 텍스트 — 빈 줄 없이 바로 이어졌다면 직전 보기의 뒷부분입니다.
         빈 줄을 건너온 뒤라면 다음 문항의 지문이므로 여기서 끊습니다. */
      if (blankRun === 0 && lastFilled >= 0) {
        choices[lastFilled] = `${choices[lastFilled]} ${cur}`.replace(/\s+/g, " ").trim();
        cursor += 1;
        continue;
      }

      /* 쪽이 바뀌며 머리말(과정명)이 낀 경우 — 다음 유효 줄이 **이어지는 순번**의
         보기라면 머리말로 보고 건너뜁니다. (③④가 다음 쪽으로 넘어가는 형태) */
      {
        let k = cursor + 1;
        while (k < to && isNoise(lines[k])) k += 1;
        const next = lines[k] ?? "";
        if (isCircleStart(next) && circleIndex(next[0]) === lastFilled + 1) {
          cursor = k;
          continue;
        }
      }
      break;
    }

    /* 3-2) 지문 — 이 문항의 보기 블록이 끝난 지점(cursor)부터 다음 문항 시작(to) 전까지 */
    const bodyLines = [];
    for (let k = cursor; k < to; k += 1) {
      const cur = lines[k];
      if (isNoise(cur) || ANSWER_LINE.test(cur) || EXPLAIN_LINE.test(cur)) continue;
      bodyLines.push(cur);
    }
    // 이 지문은 **다음** 문항의 것입니다. 첫 문항 지문은 첫 보기 앞에서 따로 모읍니다.
    questions.push({
      choices: choices.map((c) => (c ?? "").replace(/\s*\.\s*$/, "").trim()),
      inlineAnswer,
      nextBody: bodyLines.join(" ").replace(/\s+/g, " ").trim(),
    });
  }

  /* 첫 문항 지문 = 파일 시작 ~ 첫 보기 전 */
  const firstBody = [];
  for (let k = 0; k < (starts[0] ?? 0); k += 1) {
    const cur = lines[k];
    if (isNoise(cur) || ANSWER_LINE.test(cur) || EXPLAIN_LINE.test(cur)) continue;
    firstBody.push(cur);
  }

  /* ---------- 4) 지문을 한 칸씩 밀어 붙이기 ---------- */
  const out = questions.map((q, i) => {
    const raw = i === 0 ? firstBody.slice(-2).join(" ") : questions[i - 1].nextBody;
    let question = (raw ?? "")
      .replace(/\s+/g, " ")
      // 표지·머리말 잔재("○○지도사 예 상 문 제")를 지문 앞에서 걷어냅니다
      .replace(/^.*?예\s*상\s*문\s*제\s*/, "")
      .trim();

    let bodyAnswer = null;
    const m = question.match(/\(\s*([1-5])\s*\)\s*$/);
    if (m) {
      bodyAnswer = Number(m[1]);
      question = question.replace(/\(\s*[1-5]\s*\)\s*$/, "").trim();
    }

    return {
      number: i + 1,
      question,
      choices: q.choices,
      answer: q.inlineAnswer ?? bodyAnswer ?? answerTable.get(i + 1) ?? null,
    };
  });

  out.forEach((q) => {
    if (!q.question || q.question.length < 10) warnings.push(`${q.number}번: 지문이 짧거나 비었습니다`);
    if (q.choices.filter(Boolean).length < 3) warnings.push(`${q.number}번: 보기가 3개 미만입니다`);
    if (q.answer == null) warnings.push(`${q.number}번: 정답을 찾지 못했습니다`);
  });

  return { questions: out, warnings, answerTableSize: answerTable.size };
}

/* ---------- CLI ---------- */
const [, , pdfPath, outPath] = process.argv;
if (!pdfPath) {
  console.error("사용법: node scripts/parse-exam-pdf-unnumbered.mjs <pdf경로> [출력경로]");
  process.exit(1);
}

const text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" });
const { questions, warnings, answerTableSize } = parseUnnumbered(text);

const name = basename(pdfPath).replace(/\.pdf$/i, "");
const out = {
  출처: basename(pdfPath),
  exam: { name, question_count: questions.length },
  warnings,
  questions,
};

if (outPath) writeFileSync(outPath, JSON.stringify(out, null, 2));

console.log(
  `${questions.length}문항 / 정답 ${questions.filter((q) => q.answer != null).length}개 ` +
    `/ 정답표 ${answerTableSize}개 / 경고 ${warnings.length}건`,
);
