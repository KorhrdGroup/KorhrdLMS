import type { ExamQuestionType } from "@/types/database.types";

type ChoiceFields = {
  choice1: string | null;
  choice2: string | null;
  choice3: string | null;
  choice4: string | null;
  choice5: string | null;
};

export function countQuestionChoices(
  questionType: ExamQuestionType,
  choices: ChoiceFields,
): number {
  if (questionType === "ox") {
    return 2;
  }

  if (questionType === "short_answer") {
    return 0;
  }

  return [choices.choice1, choices.choice2, choices.choice3, choices.choice4, choices.choice5]
    .filter((value) => !!value?.trim())
    .length;
}

export function truncateQuestionContent(value: string, maxLength = 60) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}
