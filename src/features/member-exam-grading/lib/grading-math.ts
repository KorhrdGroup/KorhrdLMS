/**
 * 채점 규칙 — 순수 함수라 서버(저장)와 화면(미리보기)이 같은 계산을 씁니다.
 *
 * 점수 = 자동 채점으로 맞은 문제 배점 합 + 관리자가 정답 처리한 문제 배점 합.
 * 이미 자동으로 맞은 문제는 정답 처리 대상이 아닙니다(중복 가산 방지).
 */
export type GradableQuestion = {
  id: string;
  score: number;
  autoCorrect: boolean;
};

export function computeGradedScore(
  questions: GradableQuestion[],
  manualIds: Iterable<string>,
): { score: number; totalScore: number } {
  const manual = new Set(manualIds);
  let score = 0;
  let totalScore = 0;
  for (const question of questions) {
    totalScore += question.score;
    if (question.autoCorrect || manual.has(question.id)) {
      score += question.score;
    }
  }
  return { score, totalScore };
}

/** 저장할 수 있는 정답 처리만 남깁니다 — 현재 문제에 있고, 자동정답이 아닌 것. */
export function sanitizeManualIds(
  questions: GradableQuestion[],
  manualIds: Iterable<string>,
): string[] {
  const allowed = new Set(questions.filter((q) => !q.autoCorrect).map((q) => q.id));
  const result: string[] = [];
  for (const id of new Set(manualIds)) {
    if (allowed.has(id)) result.push(id);
  }
  return result;
}
