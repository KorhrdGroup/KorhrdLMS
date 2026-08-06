/**
 * 예상문제 PDF → JSON
 *
 *   node scripts/parse-exam-pdf.mjs <pdf경로> [출력경로]
 *
 * 과정마다 원본 서식이 제각각이라, 실제로 발견된 형태를 모두 받아들입니다.
 *
 *   문항 번호 :  "1." · "01." · "1" · "문제1"
 *   보기      :  "①②③④⑤"  또는 "➀➁➂➃➄" (다른 유니코드 문자입니다)
 *                한 줄에 두 개씩 붙어 나오는 2단 배치도 처리합니다
 *   정답      :  문제 줄 끝의 "( 2 )" · 보기 뒤의 "☞3" · 마지막 쪽 정답표
 *
 * 자동 파싱은 완벽하지 않으므로 확인이 필요한 지점을 warnings 에 남깁니다.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";

/** 두 벌의 원문자를 같은 순번으로 봅니다 */
const CIRCLE_SETS = [
  ["①", "②", "③", "④", "⑤"],
  ["➀", "➁", "➂", "➃", "➄"],
  ["⑴", "⑵", "⑶", "⑷", "⑸"],
];
const ALL_CIRCLES = CIRCLE_SETS.flat();
const circleIndex = (ch) => {
  for (const set of CIRCLE_SETS) {
    const i = set.indexOf(ch);
    if (i !== -1) return i;
  }
  return -1;
};
const CIRCLE_SPLIT = new RegExp(`(?=[${ALL_CIRCLES.join("")}])`);

export function parseExamText(text) {
  const warnings = [];
  const lines = text
    .split("\n")
    // \f(페이지 구분자)가 번호 앞에 붙으면 문항을 못 읽습니다
    .map((line) => line.replace(/\f/g, "").replace(/ /g, " ").trimEnd())
    .filter((line) => line.trim() !== "");

  /* ---------- 1) 마지막 쪽 정답표 ---------- */
  const answers = new Map();
  for (let i = 0; i < lines.length - 1; i += 1) {
    const head = lines[i].trim().split(/\s+/);
    const body = lines[i + 1].trim().split(/\s+/);
    const isNums = (arr) => arr.length >= 2 && arr.every((v) => /^\d{1,3}$/.test(v));
    if (!isNums(head) || !isNums(body) || head.length !== body.length) continue;
    const ascending = head.every((v, idx) => idx === 0 || Number(v) === Number(head[idx - 1]) + 1);
    if (!ascending) continue;
    head.forEach((no, idx) => {
      const value = Number(body[idx]);
      if (value >= 1 && value <= 5) answers.set(Number(no), value);
    });
  }

  /* ---------- 2) 문항 ---------- */
  const questions = [];
  let current = null;

  const push = () => {
    if (!current) return;
    current.question = current.questionLines.join(" ").replace(/\s+/g, " ").trim();
    delete current.questionLines;
    questions.push(current);
    current = null;
  };

  /** 문제 줄 끝의 "( 2 )" 형태 정답 */
  const takeInlineParen = (s) => {
    const m = s.match(/[(（]\s*([1-5])\s*[)）]\s*$/);
    return m ? { text: s.slice(0, m.index).trim(), answer: Number(m[1]) } : { text: s, answer: null };
  };
  /** "☞3" 형태 정답 */
  const takeArrow = (s) => {
    const m = s.match(/☞\s*([1-5])/);
    return m ? { text: s.replace(/☞\s*[1-5]/, "").trim(), answer: Number(m[1]) } : { text: s, answer: null };
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    // 정답표 줄은 문항으로 오인하지 않습니다
    if (/^[\d\s]+$/.test(trimmed) && trimmed.split(/\s+/).length > 2) continue;

    const startsWithCircle = circleIndex(trimmed[0]) !== -1;
    // "문제12" · "12." · "01." · "12 "
    const qMatch = !startsWithCircle && trimmed.match(/^(?:문제\s*)?(\d{1,3})\s*[.．)]?\s*(.*)$/);

    if (qMatch) {
      const no = Number(qMatch[1]);
      const expected = questions.length + 1;
      // 번호가 이어질 때만 새 문항으로 봅니다(본문 속 숫자 오인 방지)
      if (no === expected || no === expected + 1) {
        push();
        const head = takeArrow(takeInlineParen(qMatch[2]).text);
        const inline = takeInlineParen(qMatch[2]).answer ?? head.answer;
        current = { no, questionLines: head.text ? [head.text] : [], choices: [], inline };
        continue;
      }
    }

    if (!current) continue;

    // 보기가 다 찬 뒤 다시 ①이 나오면 지문이 빠진 새 문항입니다
    if (startsWithCircle && current.choices[0] && circleIndex(trimmed[0]) === 0) {
      const prevNo = current.no;
      push();
      current = { no: prevNo + 1, questionLines: [], choices: [], inline: null };
    }

    if (startsWithCircle) {
      // 2단 배치("① 가   ② 나")도 원문자 기준으로 자릅니다
      for (const part of trimmed.split(CIRCLE_SPLIT).map((p) => p.trim()).filter(Boolean)) {
        const idx = circleIndex(part[0]);
        if (idx === -1) continue;
        const cleaned = takeArrow(part.slice(1).trim());
        if (cleaned.answer) current.inline = cleaned.answer;
        current.choices[idx] = cleaned.text;
      }
      continue;
    }

    const arrow = takeArrow(trimmed);
    if (arrow.answer) {
      current.inline = arrow.answer;
      if (!arrow.text) continue;
    }

    if (current.choices.length === 0) {
      current.questionLines.push(arrow.text); // 괄호넣기 지문 등 여러 줄 문제
    } else {
      const last = current.choices.length - 1;
      if (current.choices[last]) current.choices[last] += ` ${arrow.text}`;
    }
  }
  push();

  /* ---------- 3) 합치기 ---------- */
  const result = questions
    .filter((q) => q.choices.filter(Boolean).length >= 2)
    .map((q) => {
      const choices = q.choices.filter(Boolean);
      const answer = q.inline ?? answers.get(q.no) ?? null;
      if (answer === null) warnings.push(`${q.no}번: 정답을 찾지 못했습니다`);
      else if (answer > choices.length) {
        warnings.push(`${q.no}번: 정답(${answer})이 보기 수(${choices.length})보다 큽니다`);
      }
      if (!q.question.trim()) warnings.push(`${q.no}번: 문제 지문이 원본에 없습니다 — 직접 채워주세요`);
      return { no: q.no, question: q.question, choices, answer };
    });

  if (result.length === 0) warnings.push("문항을 하나도 읽지 못했습니다(서식이 다른 파일입니다)");

  return {
    questions: result,
    warnings,
    answerCount: result.filter((q) => q.answer !== null).length,
  };
}

/* ---------- CLI ---------- */
// 다른 스크립트가 import 할 때는 CLI 가 돌지 않아야 합니다(parse-exam-auto.mjs)
const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
const [, , pdfPath, outPath] = process.argv;
if (isMain && pdfPath) {
  const text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const parsed = parseExamText(text);
  writeFileSync(
    outPath ?? pdfPath.replace(/\.pdf$/i, ".json"),
    JSON.stringify(
      {
        출처: basename(pdfPath),
        exam: { name: basename(pdfPath).replace(/\.pdf$/i, ""), question_count: parsed.questions.length },
        warnings: parsed.warnings,
        questions: parsed.questions,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${parsed.questions.length}문항 / 정답 ${parsed.answerCount}개 / 경고 ${parsed.warnings.length}건`);
}
