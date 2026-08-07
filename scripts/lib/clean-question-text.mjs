/**
 * 파싱한 문항 지문 다듬기.
 *
 * PDF에서 뽑은 지문에는 원본 페이지의 흔적이 그대로 딸려옵니다. 2026-08-07에
 * 등록돼 있던 4,597문항을 전수 조사해 나온 결함을 그대로 규칙으로 옮긴 것입니다.
 * (당시 171문항을 손으로 고쳤습니다 — 같은 일을 반복하지 않으려고 남깁니다)
 *
 *   1) 문항 번호   "01 다음이…", "28. 다음은…"
 *   2) 시험지 머리말 "○○ 문제집 ※ 답안지는 마지막 페이지에 있습니다. 1. …",
 *                  "● 풍선아트 자격시험예상문제 …", "※ 확 인 문 제 Chapter 1. …"
 *   3) 앞 기호      "& 아동미술지도사 …", "*디지털의 개념…"
 *   4) 잘린 과정명   "의 업무 중 고객의 삶과…"  ← 앞 단어가 통째로 날아간 경우
 *
 * 되돌릴 수 없는 결함(글자마다 공백이 들어간 자간 깨짐, 지문과 보기가 뒤섞인 문항)은
 * 고치지 않고 `inspectQuestion()` 이 사유를 돌려줍니다. 등록에서 빼는 편이 낫습니다.
 */

/** 지우면 문장이 조사로 시작해 버리는지 — 원문 일부를 잘라낸 신호입니다 */
const STARTS_WITH_PARTICLE =
  /^(의|은|는|이|가|을|를|에서|에게|에|와|과|도|만|으로|로|라고|이라고)\s/;

/** 한 글자마다 공백이 들어간 구간(PDF 자간 깨짐) — 원래 띄어쓰기를 복원할 수 없습니다 */
const SPACED_OUT = /(?:[가-힣] ){6,}[가-힣]/;

/** 시험지 머리말 조각. 이 말이 앞머리에 보이면 그 뒤부터가 진짜 문제입니다. */
const HEADER_HINT = /(문제집|답안지|확\s*인\s*문\s*제|자격시험예상문제|실전모의고사|모의고사|시험지)/;

function stripLeadingSymbols(text) {
  return text.replace(/^\s*[&·※▣■□○●◆◇*\-–—:,.]+\s*/, "");
}

/**
 * 앞머리에 붙은 시험지 머리말을 걷어냅니다.
 * 머리말 구간(앞 90자) 안의 **마지막 "N." 뒤**부터를 문제로 봅니다.
 * 번호가 없으면 머리말 문장 하나를 통째로 잘라냅니다.
 */
function stripHeader(text) {
  const head = text.slice(0, 90);
  if (!HEADER_HINT.test(head)) return text;

  const marks = [...head.matchAll(/\d{1,3}\.\s+/g)];
  const last = marks[marks.length - 1];
  if (last) {
    const cut = text.slice(last.index + last[0].length).trim();
    if (cut.length >= 10) return cut;
  }

  const cut = text
    .replace(/^.*?(답안지[^.]*\.|자격시험예상문제|실전모의고사|확\s*인\s*문\s*제)\s*/, "")
    .trim();
  return cut.length >= 10 ? cut : text;
}

/**
 * 문항 번호를 뗍니다.
 * "3 3강좌에서…" 처럼 뒤가 "강"으로 이어지면 번호가 아니라 붙여야 할 숫자라
 * 떼지 않고 공백만 없앱니다(그러지 않으면 "몇 강"인지 사라집니다).
 */
function stripLeadingNumber(text) {
  const dotted = text.replace(/^\s*\d{1,3}\s*[.)]\s*/, "");
  if (dotted !== text) return dotted;

  const m = text.match(/^\s*(\d{1,2})\s+(\S.*)$/s);
  if (!m) return text;
  if (/^강/.test(m[2])) return `${m[1]}${m[2]}`;
  return m[2];
}

/**
 * 지문 한 건을 다듬습니다.
 * `courseName` 을 주면 앞 단어가 잘려 조사로 시작하는 지문에 과정명을 되붙입니다.
 */
export function cleanQuestionText(raw, { courseName } = {}) {
  if (typeof raw !== "string") return raw;
  let text = raw.replace(/\s+/g, " ").trim();

  for (let i = 0; i < 3; i += 1) {
    const before = text;
    text = stripHeader(text);
    text = stripLeadingSymbols(text);
    const numbered = stripLeadingNumber(text);
    // 번호를 떼서 조사로 시작하면 원문을 자른 것이므로 되돌립니다
    text = STARTS_WITH_PARTICLE.test(numbered) ? text : numbered;
    text = text.trim();
    if (text === before) break;
  }

  // "의 업무 중 고객의 삶과…" → "보험심사관리사의 업무 중…"
  if (courseName && STARTS_WITH_PARTICLE.test(text)) {
    text = `${courseName}${text}`;
  }

  return text.length >= 10 ? text : raw.trim();
}

/**
 * 등록해도 되는 문항인지 봅니다. `ok:false` 면 사유(reason)를 붙여 돌려줍니다.
 * 고칠 수 없는 결함이라 등록에서 빼는 쪽이 낫습니다.
 */
export function inspectQuestion(q) {
  const text = (q.question ?? "").trim();
  const choices = (q.choices ?? []).map((c) => String(c ?? "").trim()).filter(Boolean);

  if (text.length < 10) return { ok: false, reason: "지문이 너무 짧음" };
  if (SPACED_OUT.test(text) || choices.some((c) => SPACED_OUT.test(c))) {
    return { ok: false, reason: "글자마다 공백(PDF 자간 깨짐) — 띄어쓰기 복원 불가" };
  }
  if (STARTS_WITH_PARTICLE.test(text)) return { ok: false, reason: "앞 단어가 잘림" };
  if (/^[①-⑩]/.test(text)) return { ok: false, reason: "보기 조각으로 시작" };
  if (choices.length < 2) return { ok: false, reason: "보기 부족" };
  // 보기가 지문 조각인 경우 — 곤충 이름 자리에 설명문이 들어온 사례가 있었습니다
  if (choices.some((c) => c.length > 120)) return { ok: false, reason: "보기가 지문 조각으로 보임" };

  return { ok: true };
}

/** 문항 배열 전체를 다듬습니다(지문·보기 공백 정리 포함). */
export function cleanQuestions(questions, { courseName } = {}) {
  return questions.map((q) => ({
    ...q,
    question: cleanQuestionText(q.question, { courseName }),
    choices: (q.choices ?? []).map((c) => String(c ?? "").replace(/\s+/g, " ").trim()),
  }));
}
