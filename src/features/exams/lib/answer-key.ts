/**
 * 문항 정답 표기.
 *
 * `exam_questions.answer` 는 TEXT 한 칸입니다. 복수정답 문항은
 * **쉼표로 이어 붙여** 넣습니다(예: `"2,4"`). 단일정답은 그대로 `"2"` 입니다.
 * 원본 예상문제 정답표에 "2, 4" · "1, 2, 3, 4" 처럼 복수정답 칸이 있어
 * 별도 컬럼을 두지 않고 이 규칙 하나로 맞췄습니다.
 *
 * OX·주관식도 같은 함수를 쓰지만 값이 하나뿐이라 결과가 달라지지 않습니다.
 */

/** `"2,4"` → `["2","4"]`. 공백과 빈 칸은 버립니다. */
export function parseAnswerKey(answer: string): string[] {
  return answer
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/** 복수정답 문항인지 */
export function isMultipleAnswer(answer: string): boolean {
  return parseAnswerKey(answer).length > 1;
}

/** 화면 표기 — `"2,4"` → `"2, 4"` */
export function formatAnswerKey(answer: string): string {
  return parseAnswerKey(answer).join(", ");
}

/** 고른 보기가 정답에 포함되는지(정답 강조용) */
export function isAnswerChoice(answer: string, choiceId: string): boolean {
  return parseAnswerKey(answer).includes(choiceId);
}

/**
 * 채점. 복수정답은 **정확히 같은 집합**일 때만 정답입니다
 * (부분점수는 주지 않습니다 — 수료 기준이 문항 단위라서요).
 * 제출값도 쉼표로 이어 붙인 문자열입니다.
 */
export function isCorrectAnswer(answer: string, submitted: string | undefined): boolean {
  if (!submitted) return false;
  const key = parseAnswerKey(answer).map((v) => v.toUpperCase()).sort();
  const mine = parseAnswerKey(submitted).map((v) => v.toUpperCase()).sort();
  return key.length === mine.length && key.every((value, i) => value === mine[i]);
}
