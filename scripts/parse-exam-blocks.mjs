/**
 * 예상문제 PDF → JSON (블록형)
 *
 *   node scripts/parse-exam-blocks.mjs <pdf경로> [출력경로] [--cols 2]
 *
 * `parse-exam-pdf.mjs` 는 "1." 처럼 문항 번호가 붙은 원본을 전제로 합니다.
 * 그런데 실제 원본의 절반쯤은 **번호가 아예 없고** 빈 줄로만 문항을 나눕니다.
 * 번호 기반 파서를 그대로 쓰면 다음 문항의 지문이 앞 문항 ④번 보기 뒤에 붙고,
 * 정답표를 문항 번호로 찾다가 통째로 어긋납니다(실제로 그렇게 나왔습니다).
 *
 * 그래서 여기서는 번호를 안 봅니다. 빈 줄로 블록을 자르고,
 * "보기 묶음처럼 생긴 블록"을 만나면 그 앞에 쌓인 줄을 지문으로 확정합니다.
 *
 * 감당하는 서식(전부 실제 원본에서 나온 것들입니다)
 *   보기 :  ①②③④⑤ · ➀➁➂➃➄ · ⑴⑵⑶⑷ · "1)" · "(1)" · "1."
 *           한 줄에 두 개씩 붙는 2단 배치 포함
 *   정답 :  지문 끝의 "( 2 )" · 지문 끝의 맨숫자("...것은?  4") · 지문 끝의 "④"
 *           · "☞3" · 별도 줄 "정답: 2" / "정답:1)" · 마지막 쪽 정답표
 *   군더더기 : "예 상 문 제" 머리글, 쪽번호, "해설) ...", "자료1 _ ..."
 *
 * 원본이 2단 조판이면 `--cols 2` 로 왼쪽/오른쪽을 따로 뽑아 이어 붙입니다
 * (그냥 뽑으면 두 단이 한 줄에 섞여 나옵니다).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";

const CIRCLES = [
  ["①", "②", "③", "④", "⑤"],
  ["➀", "➁", "➂", "➃", "➄"],
  ["⑴", "⑵", "⑶", "⑷", "⑸"],
  ["㉠", "㉡", "㉢", "㉣", "㉤"],
  ["⓵", "⓶", "⓷", "⓸", "⓹"],
];
const ALL_CIRCLES = CIRCLES.flat();
const circleIndex = (ch) => {
  for (const set of CIRCLES) {
    const i = set.indexOf(ch);
    if (i !== -1) return i;
  }
  return -1;
};

/** "3" → 2, "C" → 2 (0부터) */
const markerIndex = (token) =>
  /^[A-E]$/.test(token) ? token.charCodeAt(0) - 65 : Number(token) - 1;

/** 줄에서 보기 표식을 찾습니다 → [{ index, text }] (index는 0부터) */
function splitChoiceLine(line, family) {
  const out = [];
  // 원문자: 표식 앞에서 자릅니다
  if (family !== "letter" && [...line].some((ch) => circleIndex(ch) !== -1)) {
    const parts = line.split(new RegExp(`(?=[${ALL_CIRCLES.join("")}])`));
    for (const part of parts) {
      const trimmed = part.trim();
      const idx = circleIndex(trimmed[0]);
      if (idx === -1) continue;
      out.push({ index: idx, text: trimmed.slice(1).trim() });
    }
    return out;
  }
  // "1) ..." · "(1) ..." · "1. ..." · "A) ..."(스캔본 OCR 결과에 나옵니다)
  // — 줄 처음과 공백 뒤에서만 표식으로 봅니다
  if (family === "circle") return out; // 원문자 원본에서 "1." 은 문항 번호입니다
  const token = family === "letter" ? "[A-E]" : family === "digit" ? "[1-5]" : "[1-5]|[A-E]";
  const re = new RegExp(`(?:^|\\s)[(（]?(${token})[).．]\\s*`, "g");
  const hits = [...line.matchAll(re)];
  if (hits.length === 0) return out;
  hits.forEach((hit, i) => {
    const start = hit.index + hit[0].length;
    const end = i + 1 < hits.length ? hits[i + 1].index : line.length;
    out.push({ index: markerIndex(hit[1]), text: line.slice(start, end).trim() });
  });
  return out;
}

const startsChoice = (line, wanted, family) => {
  const t = line.trim();
  const hit = splitChoiceLine(t, family)[0];
  if (hit === undefined || hit.index !== wanted) return false;
  // 표식이 줄 맨 앞에 있어야 보기입니다 — 지문 속 "만드는( ① )에서" 는 보기가 아닙니다
  return circleIndex(t[0]) !== -1 || /^[(（]?([1-5]|[A-E])[).．]\s/.test(t);
};

/**
 * 블록의 뒤쪽에서 "1번부터 순서대로 이어지는 보기 묶음"을 찾습니다.
 * 지문과 보기가 빈 줄 없이 한 블록에 들어 있는 원본이 있어(ESG·방역관리사)
 * 블록 전체가 보기라고 가정하면 안 됩니다.
 *
 * @returns {{ stem: string[], choices: string[] } | null}
 */
/** 보기 번호가 `from`(0부터) 부터 이어지는 묶음을 읽습니다 — 쪽 넘김 이어붙이기용 */
function splitStemAndChoicesFrom(lines, from) {
  const choices = [];
  for (const line of lines) {
    const hits = splitChoiceLine(line);
    if (hits.length === 0) {
      if (choices.length === 0) return null;
      choices[choices.length - 1] += ` ${line.trim()}`;
      continue;
    }
    for (const hit of hits) {
      if (hit.index !== from + choices.length) return null;
      choices.push(hit.text);
    }
  }
  return choices.length ? choices.map((c) => c.replace(/\s+/g, " ").trim()) : null;
}

function splitStemAndChoices(lines) {
  // 보기를 "①" 이나 "A)" 로 다는 원본에서는 문항 번호 "1." 을 보기로 오해하면 안 됩니다.
  // 블록에 그런 보기가 하나라도 있으면 그 블록의 보기 표식을 그쪽으로 고정합니다.
  const family = lines.some((l) => circleIndex(l.trim()[0]) !== -1)
    ? "circle"
    : lines.some((l) => /^\s*[(（]?[A-E][).．]\s/.test(l))
      ? "letter"
      : undefined;

  for (let start = 0; start < lines.length; start += 1) {
    if (!startsChoice(lines[start], 0, family)) continue;

    const choices = [];
    const indentOf = (line) => line.length - line.trimStart().length;
    let markerIndent = indentOf(lines[start]);
    let ok = true;
    let endAt = lines.length;
    for (let i = start; i < lines.length; i += 1) {
      endAt = i + 1;
      const hits = splitChoiceLine(lines[i], family);
      if (hits.length === 0) {
        if (choices.length === 0) { ok = false; break; }
        // 정답 표식이 나오면 그 문항의 보기는 거기서 끝입니다
        if (lines[i].startsWith(ANSWER_MARK)) { endAt = i; break; }
        // "2. 다음 중 ..." 처럼 다음 문항이 시작되면 보기 묶음은 여기서 끝입니다
        if (/^\d{1,3}\s*[.．)]\s+\S/.test(lines[i].trim()) && choices.length >= 2) {
          endAt = i;
          break;
        }
        // 들여쓰기가 더 깊으면 앞 보기의 줄바꿈입니다.
        // 같은 깊이면 원본에서 ②③④ 표식이 빠진 보기입니다(실제로 그런 원본이 있습니다).
        if (indentOf(lines[i]) > markerIndent && choices.length < 5) {
          choices[choices.length - 1] += ` ${lines[i].trim()}`;
        } else if (choices.length < 5) {
          choices.push(lines[i].trim());
        } else {
          choices[choices.length - 1] += ` ${lines[i].trim()}`;
        }
        continue;
      }
      markerIndent = indentOf(lines[i]);
      let done = false;
      for (const hit of hits) {
        if (hit.index === choices.length) {
          choices.push(hit.text);
          continue;
        }
        // 원본 오타로 보기 안에 표식이 또 나오는 경우가 있습니다("④ ① 피부에 남는...").
        // 순번이 안 맞으면 표식이 아니라 본문으로 봅니다.
        // 다시 1번 표식이 나오면 같은 블록 안의 "다음 문항"입니다(스캔본 OCR 결과).
        if (hit.index === 0 && choices.length >= 2) {
          endAt = i;
          done = true;
          break;
        }
        // 원본 오타로 보기 안에 표식이 또 나오는 경우가 있습니다("④ ① 피부에 남는...").
        // 순번이 안 맞으면 표식이 아니라 본문으로 봅니다.
        if (choices.length > 0) {
          choices[choices.length - 1] += ` ${hit.text}`;
          continue;
        }
        ok = false;
        break;
      }
      if (done || !ok) break;
    }
    // 보기 하나만 있어도 문항으로 잡습니다 — 쪽이 넘어가면 ①만 남고 ②③④가 다음 쪽으로 갑니다.
    // 이어붙이지 못한 1개짜리는 마지막에 걸러냅니다.
    if (ok && choices.length >= 1) {
      return {
        stem: lines.slice(0, start),
        choices: choices.map((c) => c.replace(/\s+/g, " ").trim()),
        end: endAt,
      };
    }
  }
  return null;
}

const HEADER = /^(예\s*상\s*문\s*제|기\s*출\s*문\s*제|확\s*인\s*문\s*제|memo\s|시험\s*예상\s*문제|자료\s*\d+\s*[_-]|정\s*답\s*표)/;
/** "[4점] 난이도 상" 처럼 문항 사이에 끼는 배점·난이도 표기 */
const SCORE_TAG = /^\[?\s*\d+\s*점\s*\]?\s*(난이도\s*\S*)?$|^난이도\s*\S*$/;
const isNoise = (line) => {
  const t = line.trim();
  if (t === "") return true;
  if (SCORE_TAG.test(t.replace(/\s+/g, " "))) return true;
  if (/^[\d\s.·-]+$/.test(t)) return true; // 쪽번호·정답표 줄
  if (HEADER.test(t.replace(/\s+/g, " "))) return true;
  return false;
};

/**
 * "정답: C 해설: ..." 처럼 정답 뒤에 해설이 이어지고, 해설이 여러 줄로 흐르는 원본이 있습니다
 * (스캔본 OCR 결과가 특히 그렇습니다 — 빈 줄이 없어 해설 줄이 보기로 딸려 들어갑니다).
 * 해설은 정답 표기만 남기고 다음 문항/보기가 시작될 때까지 통째로 버립니다.
 */
function stripExplanations(lines) {
  const out = [];
  const isBoundary = (t) =>
    /^\d{1,3}\s*[.．)]\s+\S/.test(t) || /^문\s*제\s*\d/.test(t) || splitChoiceLine(t)[0]?.index === 0;

  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    const at = t.search(/(해설|풀이)\s*[)）:：.．]/);
    if (at === -1) {
      out.push(lines[i]);
      continue;
    }

    // 해설이 끝나는 지점(다음 문항/보기/빈 줄)까지 걷어냅니다
    let end = i + 1;
    while (end < lines.length) {
      const next = lines[end].trim();
      if (next === "" || isBoundary(next)) break;
      end += 1;
    }

    // 버리기 전에 해설 끝에 붙은 정답을 건져냅니다(세차관리사 등)
    //  · "☞ 2"  · 해설 다음 줄에 숫자만 덩그러니 있는 형태
    const region = lines.slice(i, end);
    const dropped = region.join(" ");
    const arrow =
      dropped.match(/☞\s*([1-5])/) ??
      region[region.length - 1]?.trim().match(/^([1-5])$/) ??
      null;

    const head = lines[i].slice(0, lines[i].search(/(해설|풀이)\s*[)）:：.．]/)).trimEnd();
    if (head.replace(/▶/g, "").trim()) out.push(head);
    if (arrow) out.push(`${ANSWER_MARK}${arrow[1]}`);
    i = end - 1;
  }
  return out;
}

/** "해설) ..." 뒤는 문제와 무관하므로 잘라냅니다 */
const cutExplanation = (lines) => {
  const at = lines.findIndex((l) => /^\s*(해설|풀이)\s*[)）:：]/.test(l));
  return at === -1 ? lines : lines.slice(0, at);
};

/** 정답 줄을 자리만 남겨 표시해 두는 표식 — 본문에 나올 수 없는 문자입니다 */
const ANSWER_MARK = "\u0000정답:";
const ANSWER_LINE = /정\s*답\s*[:：]?\s*[(（]?\s*([1-5]|[A-E])(?![A-Za-z])/;
/**
 * 정답 줄에서 값을 뽑습니다 → [2] 또는 [4, 1, 1, 3]
 *
 * "정답:③" 처럼 원문자로 적기도 하고, "정답 : 4, 1, 1, 3" 처럼
 * **여러 문항 정답을 한 줄에 몰아 적는** 원본도 있습니다(방과후지도사).
 * 그런 줄은 바로 앞 문항들에 순서대로 나눠 붙입니다.
 */
function statedAnswers(line) {
  if (!/정\s*답/.test(line)) return null;
  const rest = line.slice(line.search(/정\s*답/)).replace(/^정\s*답\s*[:：]?/, "");

  const many = rest.match(/^\s*([1-5])(\s*,\s*[1-5])+\s*$/);
  if (many) return rest.split(",").map((v) => Number(v.trim()));

  const token = line.match(ANSWER_LINE);
  if (token) return [markerIndex(token[1]) + 1];
  for (const ch of rest) {
    const idx = circleIndex(ch);
    if (idx !== -1) return [idx + 1];
  }
  return null;
}

/** 지문 끝에 붙은 정답 표기를 떼어냅니다 */
function takeAnswerFromStem(stem) {
  let text = stem;
  let answer = null;

  const paren = text.match(/[(（]\s*([1-5])\s*[)）]\s*$/);
  if (paren) {
    answer = Number(paren[1]);
    text = text.slice(0, paren.index).trim();
  }
  const arrow = text.match(/☞\s*([1-5])/);
  if (arrow) {
    answer = Number(arrow[1]);
    text = text.replace(/☞\s*[1-5]/, "").trim();
  }
  const circle = text.match(/([①-⑤➀-➄])\s*$/);
  if (circle && answer === null) {
    answer = circleIndex(circle[1]) + 1;
    text = text.slice(0, circle.index).trim();
  }
  // "...아닌 것은?   4" — 물음표 뒤 맨숫자만 정답으로 봅니다(본문 숫자 오인 방지)
  const bare = text.match(/[?？]\s*([1-5])\s*$/);
  if (bare && answer === null) {
    answer = Number(bare[1]);
    text = text.slice(0, bare.index + 1).trim();
  }
  // "O . X 퀴즈 ( 2 ) 꽉잡아 하비 게임은..." 처럼 지문 중간에 박힌 정답 표기.
  // 지문 안에 그런 괄호가 딱 하나일 때만 정답으로 봅니다(본문 속 "(3)" 오인 방지).
  if (answer === null) {
    const all = [...text.matchAll(/[(（]\s*([1-5])\s*[)）]/g)];
    if (all.length === 1) {
      answer = Number(all[0][1]);
      text = (text.slice(0, all[0].index) + " " + text.slice(all[0].index + all[0][0].length))
        .replace(/\s+/g, " ")
        .trim();
    }
  }
  const inline = text.match(ANSWER_LINE);
  if (inline && answer === null) {
    answer = Number(inline[1]);
    text = text.replace(ANSWER_LINE, "").trim();
  }

  return { text, answer };
}

/** 마지막 쪽 정답표(번호줄 / 정답줄이 짝지어 나오는 표) */
function readAnswerTable(lines) {
  const table = new Map();
  for (let i = 0; i < lines.length - 1; i += 1) {
    const head = lines[i].trim().split(/\s+/);
    const body = lines[i + 1].trim().split(/\s+/);
    const nums = (arr) => arr.length >= 2 && arr.every((v) => /^\d{1,3}$/.test(v));
    if (!nums(head) || !nums(body) || head.length !== body.length) continue;
    const ascending = head.every((v, idx) => idx === 0 || Number(v) === Number(head[idx - 1]) + 1);
    if (!ascending) continue;
    head.forEach((no, idx) => {
      const value = Number(body[idx]);
      if (value >= 1 && value <= 5) table.set(Number(no), value);
    });
  }
  return table;
}

export function parseExamBlocks(text) {
  const warnings = [];
  const rawLines = stripExplanations(
    text.split("\n").map((l) => l.replace(/\f/g, "").replace(/ /g, " ").trimEnd()),
  );
  const answerTable = readAnswerTable(rawLines);

  /* 빈 줄로 블록 나누기 */
  const blocks = [];
  let cur = [];
  for (const line of rawLines) {
    if (line.trim() === "") {
      if (cur.length) blocks.push(cur);
      cur = [];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) blocks.push(cur);

  // 첫 줄은 대개 문서 제목("환경관리전문가")이라 1번 지문 앞에 붙습니다 — 떼어냅니다
  const docTitle = (rawLines.find((l) => l.trim() !== "") ?? "").trim();

  const questions = [];
  let stemBuf = [];

  for (const block of blocks) {
    // "정답: 2" 줄은 보기 줄바꿈으로 오해되기 쉬워 표식(ANSWER_MARK)으로 바꿔 둡니다.
    // 걷어내 버리면 안 됩니다 — 한 블록에 문항이 여러 개면 어느 문항의 정답인지
    // 순서를 잃어버려 통째로 한 칸씩 밀립니다(실제로 그렇게 나왔습니다).
    const lines = cutExplanation(block)
      .map((l) => {
        const found = statedAnswers(l);
        return found === null ? l : `${ANSWER_MARK}${found.join(",")}`;
      })
      // 쪽바닥 머리글(과정명)도 군더더기입니다 — 보기가 쪽을 넘어갈 때 사이에 끼어듭니다
      .filter((l) => l.startsWith(ANSWER_MARK) || (!isNoise(l) && l.trim() !== docTitle));

    /** 맨 앞에 남은 정답 표식을 떼어 돌려줍니다(직전 문항들 몫입니다) */
    const takeLeadingMark = (rows) => {
      let values = null;
      let i = 0;
      while (i < rows.length && rows[i].startsWith(ANSWER_MARK)) {
        values ??= rows[i].slice(ANSWER_MARK.length).split(",").map(Number);
        i += 1;
      }
      return { values, rows: rows.slice(i) };
    };

    /** 값이 여러 개면 바로 앞 문항들에 순서대로 나눠 붙입니다 */
    const assign = (values) => {
      if (!values) return;
      const targets = questions.slice(-values.length);
      if (targets.length !== values.length) return;
      targets.forEach((q, i) => { q.answer ??= values[i]; });
    };

    const head = takeLeadingMark(lines);
    assign(head.values);
    let rest = head.rows;
    if (rest.length === 0) continue;

    // 보기가 쪽을 넘어가면 "③④"만 있는 블록이 따로 떨어집니다 — 앞 문항에 이어 붙입니다
    const prev = questions[questions.length - 1];
    if (prev && stemBuf.length === 0 && startsChoice(rest[0], prev.choices.length)) {
      const carry = splitStemAndChoicesFrom(rest, prev.choices.length);
      if (carry) {
        prev.choices.push(...carry);
        continue;
      }
    }

    // 스캔본 OCR 결과는 빈 줄이 없어 한 블록에 문항이 여러 개 들어 있습니다.
    let split = splitStemAndChoices(rest);
    if (!split) {
      stemBuf.push(...rest.filter((l) => !l.startsWith(ANSWER_MARK)));
      continue;
    }

    let first = true;
    while (split) {
      const stemLines = first ? [...stemBuf, ...split.stem] : split.stem;
      if (first) stemBuf = [];
      first = false;

      // 문항 번호가 붙어 있으면 떼어냅니다("1.ESG 경영의..." → "ESG 경영의...")
      const joined = stemLines
        .filter((l) => !l.startsWith(ANSWER_MARK))
        .join(" ")
        .replace(/\s+/g, " ")
        .replace(new RegExp(`^${docTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`), "")
        .replace(/^문\s*제\s*\d{1,3}\s*[.．)]?\s*/, "")
        .replace(/^\d{1,3}\s*[.．)]\s*/, "")
        .trim();
      const { text: question, answer } = takeAnswerFromStem(joined);

      const after = takeLeadingMark(rest.slice(split.end));
      questions.push({ question, choices: split.choices, answer });
      assign(after.values);

      // 한 줄도 못 줄이면 무한루프입니다 — 반드시 앞으로 나아가게 합니다
      const consumed = rest.length - after.rows.length;
      rest = consumed > 0 ? after.rows : rest.slice(1);
      split = rest.length > 0 ? splitStemAndChoices(rest) : null;
    }
  }

  /* 보기가 2개도 안 되는 건 문항으로 못 씁니다(쪽 넘김을 못 이어붙인 잔해) */
  const result = questions
    .filter((q) => q.choices.length >= 2)
    .map((q, i) => ({ no: i + 1, question: q.question, choices: q.choices, answer: q.answer }));

  /* 정답표는 문항 수가 정확히 맞을 때만 씁니다 — 어긋난 채로 붙이면 전부 오답이 됩니다 */
  if (result.some((q) => q.answer === null) && answerTable.size > 0) {
    if (answerTable.size === result.length) {
      result.forEach((q, i) => { q.answer ??= answerTable.get(i + 1) ?? null; });
    } else {
      warnings.push(
        `정답표(${answerTable.size}개)와 읽어낸 문항 수(${result.length}개)가 달라 정답표를 쓰지 않았습니다`,
      );
    }
  }

  result.forEach((q) => {
    if (!q.question) warnings.push(`${q.no}번: 지문을 찾지 못했습니다`);
    else if (q.answer === null) warnings.push(`${q.no}번: 정답을 찾지 못했습니다`);
    else if (q.answer > q.choices.length) warnings.push(`${q.no}번: 정답(${q.answer})이 보기 수(${q.choices.length})보다 큽니다`);
  });
  if (result.length === 0) warnings.push("문항을 하나도 읽지 못했습니다");

  return {
    questions: result,
    warnings,
    answerCount: result.filter((q) => q.answer !== null).length,
  };
}

/** 2단 조판은 왼쪽·오른쪽을 따로 뽑아 이어 붙입니다 */
export function pdfToText(pdfPath, columns = 1) {
  // 스캔본은 scripts/ocr-pdf.swift 로 뽑아둔 .txt 를 그대로 받습니다
  if (/\.txt$/i.test(pdfPath)) return readFileSync(pdfPath, "utf8");

  const run = (args) =>
    execFileSync("pdftotext", [...args, "-layout", pdfPath, "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (columns < 2) return run([]);

  const info = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  const size = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
  const width = Math.round(Number(size?.[1] ?? 595));
  const height = Math.round(Number(size?.[2] ?? 842));
  const half = Math.round(width / 2);
  return `${run(["-x", "0", "-y", "0", "-W", String(half), "-H", String(height)])}\n${run([
    "-x", String(half), "-y", "0", "-W", String(width - half), "-H", String(height),
  ])}`;
}

/* ---------- CLI ---------- */
// 다른 스크립트가 import 할 때는 CLI 가 돌지 않아야 합니다(parse-exam-auto.mjs)
const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
const [, , pdfPath, outPath, ...rest] = process.argv;
if (isMain && pdfPath) {
  const colsAt = rest.indexOf("--cols");
  const columns = colsAt === -1 ? 1 : Number(rest[colsAt + 1] ?? 1);
  const parsed = parseExamBlocks(pdfToText(pdfPath, columns));
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
