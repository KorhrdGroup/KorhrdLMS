import {
  EXAM_QUESTION_ITEM_SELECT,
  EXAM_QUESTION_SUMMARY_SELECT,
} from "@/features/exams/constants";
import { countQuestionChoices } from "@/features/exams/lib/exam-question-item.utils";
import type {
  ExamQuestionItem,
  GetExamQuestionManagePageResult,
} from "@/features/exams/types/exam-question-item.types";
import { createClient } from "@/lib/supabase/server";
import type { ExamQuestionType } from "@/types/database.types";

type ExamSummaryRow = {
  id: string;
  name: string;
  question_count: number;
  course: {
    id: string;
    name: string;
    deleted_at: string | null;
  };
};

type ExamQuestionRow = {
  id: string;
  exam_id: string;
  question_type: ExamQuestionType;
  question: string;
  choice1: string | null;
  choice2: string | null;
  choice3: string | null;
  choice4: string | null;
  choice5: string | null;
  answer: string;
  score: number;
  sort_order: number;
};

function mapExamQuestionItem(row: ExamQuestionRow, index: number): ExamQuestionItem {
  return {
    id: row.id,
    number: index + 1,
    questionType: row.question_type,
    question: row.question,
    choiceCount: countQuestionChoices(row.question_type, row),
    answer: row.answer,
    score: row.score,
    sortOrder: row.sort_order,
  };
}

export async function getExamQuestionManagePage(
  examId: string,
): Promise<GetExamQuestionManagePageResult> {
  if (!examId.trim()) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const [examResult, questionsResult] = await Promise.all([
    supabase
      .from("exams")
      .select(EXAM_QUESTION_SUMMARY_SELECT)
      .eq("id", examId)
      .is("deleted_at", null)
      .is("course.deleted_at", null)
      .maybeSingle(),
    supabase
      .from("exam_questions")
      .select(EXAM_QUESTION_ITEM_SELECT)
      .eq("exam_id", examId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (examResult.error) {
    throw new Error(examResult.error.message);
  }

  if (questionsResult.error) {
    throw new Error(questionsResult.error.message);
  }

  if (!examResult.data) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const exam = examResult.data as ExamSummaryRow;
  const questions = ((questionsResult.data ?? []) as ExamQuestionRow[]).map(mapExamQuestionItem);
  const registeredQuestionCount = questions.length;

  return {
    success: true,
    summary: {
      examId: exam.id,
      examName: exam.name,
      courseName: exam.course.name,
      totalQuestionCount: exam.question_count,
      registeredQuestionCount,
    },
    questions,
  };
}
