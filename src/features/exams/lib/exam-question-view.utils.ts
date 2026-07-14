import type { ExamQuestionViewItem } from "@/features/exams/types/exam-question-view.types";
import { formatDate } from "@/lib/shared/format-date";
import type { ExamQuestionType } from "@/types/database.types";

type ChoiceFields = Pick<
  ExamQuestionViewItem,
  "choice1" | "choice2" | "choice3" | "choice4" | "choice5"
>;

export function formatExamPeriod(examStart: string | null, examEnd: string | null) {
  if (examStart && examEnd) {
    return `${formatDate(examStart)} ~ ${formatDate(examEnd)}`;
  }

  if (examStart) {
    return formatDate(examStart);
  }

  if (examEnd) {
    return formatDate(examEnd);
  }

  return "—";
}

export function formatExamDuration(minutes: number | null | undefined) {
  if (minutes == null || Number.isNaN(minutes)) {
    return "—";
  }

  return `${minutes}분`;
}

export function getQuestionChoicesDisplay(
  questionType: ExamQuestionType,
  choices: ChoiceFields,
): string[] {
  if (questionType === "short_answer") {
    return [];
  }

  if (questionType === "ox") {
    return ["O", "X"];
  }

  return ([1, 2, 3, 4, 5] as const)
    .map((index) => {
      const value = choices[`choice${index}`]?.trim();
      if (!value) {
        return null;
      }

      return `${index}. ${value}`;
    })
    .filter((value): value is string => !!value);
}

export function formatQuestionAnswerDisplay(
  questionType: ExamQuestionType,
  answer: string,
): string {
  if (questionType === "multiple_choice") {
    return `${answer.trim()}번`;
  }

  return answer.trim();
}

export function calculateQuestionViewTotals(questions: ExamQuestionViewItem[]) {
  return {
    totalQuestionCount: questions.length,
    totalScore: questions.reduce((sum, question) => sum + question.score, 0),
  };
}
