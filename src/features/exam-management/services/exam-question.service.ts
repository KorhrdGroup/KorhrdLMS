import {
  addQuestionRecord,
  deleteQuestionRecord,
  findExamById,
  findQuestionById,
  moveQuestionRecord,
  updateQuestionRecord,
} from "@/features/exam-management/repositories/exam.repository";
import type { Exam, ExamQuestionAnswer } from "@/features/exam-management/types/exam.types";
import type {
  ExamQuestionActionResult,
  ExamQuestionInput,
  ExamQuestionMoveDirection,
  GetExamQuestionResult,
  GetExamQuestionsResult,
} from "@/features/exam-management/types/exam-question-form.types";

const VALID_ANSWERS: ExamQuestionAnswer[] = ["1", "2", "3", "4"];

function sortedQuestions(exam: Exam) {
  return [...exam.questions].sort((a, b) => a.order - b.order);
}

function validateQuestionInput(
  input: ExamQuestionInput,
):
  | { field: keyof ExamQuestionInput; message: string }
  | {
      question: string;
      choice1: string;
      choice2: string;
      choice3: string;
      choice4: string;
      answer: ExamQuestionAnswer;
      score: number;
    } {
  const question = input.question.trim();
  const choice1 = input.choice1.trim();
  const choice2 = input.choice2.trim();
  const choice3 = input.choice3.trim();
  const choice4 = input.choice4.trim();

  if (!question) {
    return { field: "question", message: "문제 내용을 입력해주세요." };
  }

  if (!choice1 || !choice2 || !choice3 || !choice4) {
    return { field: "choice1", message: "보기 4개를 모두 입력해주세요." };
  }

  if (!input.answer || !VALID_ANSWERS.includes(input.answer as ExamQuestionAnswer)) {
    return { field: "answer", message: "정답을 선택해주세요." };
  }

  const score = Number(input.score);
  if (!Number.isFinite(score) || score <= 0) {
    return { field: "score", message: "배점을 올바르게 입력해주세요." };
  }

  return {
    question,
    choice1,
    choice2,
    choice3,
    choice4,
    answer: input.answer as ExamQuestionAnswer,
    score,
  };
}

export async function getExamQuestions(examId: string): Promise<GetExamQuestionsResult> {
  const exam = await findExamById(examId);

  if (!exam) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const questions = sortedQuestions(exam);

  return {
    success: true,
    summary: {
      examId: exam.id,
      examTitle: exam.title,
      courseName: exam.courseName,
      isPublished: exam.isPublished,
      questionCount: questions.length,
      totalScore: questions.reduce((sum, question) => sum + question.score, 0),
    },
    questions,
  };
}

export async function getExamQuestion(
  examId: string,
  questionId: string,
): Promise<GetExamQuestionResult> {
  const question = await findQuestionById(examId, questionId);

  if (!question) {
    return { success: false, message: "문제 정보를 찾을 수 없습니다." };
  }

  return { success: true, question };
}

export async function addExamQuestion(
  examId: string,
  input: ExamQuestionInput,
): Promise<ExamQuestionActionResult> {
  const parsed = validateQuestionInput(input);

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  const created = await addQuestionRecord(examId, parsed);

  if (!created) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: "문제가 등록되었습니다." };
}

export async function updateExamQuestion(
  examId: string,
  questionId: string,
  input: ExamQuestionInput,
): Promise<ExamQuestionActionResult> {
  const parsed = validateQuestionInput(input);

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  const ok = await updateQuestionRecord(examId, questionId, parsed);

  if (!ok) {
    return { success: false, message: "문제 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: "문제가 수정되었습니다." };
}

export async function deleteExamQuestion(
  examId: string,
  questionId: string,
): Promise<ExamQuestionActionResult> {
  const ok = await deleteQuestionRecord(examId, questionId);

  if (!ok) {
    return { success: false, message: "문제 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: "문제가 삭제되었습니다." };
}

export async function moveExamQuestion(
  examId: string,
  questionId: string,
  direction: ExamQuestionMoveDirection,
): Promise<ExamQuestionActionResult> {
  const ok = await moveQuestionRecord(examId, questionId, direction);

  if (!ok) {
    return { success: false, message: "더 이상 순서를 변경할 수 없습니다." };
  }

  return { success: true, message: "문제 순서가 변경되었습니다." };
}
