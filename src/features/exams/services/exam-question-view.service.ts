import {
  EXAM_QUESTION_ITEM_SELECT,
  EXAM_QUESTION_VIEW_SUMMARY_SELECT,
} from "@/features/exams/constants";
import {
  calculateQuestionViewTotals,
  formatExamDuration,
  formatExamPeriod,
} from "@/features/exams/lib/exam-question-view.utils";
import type {
  ExamQuestionViewItem,
  GetExamQuestionViewPageResult,
} from "@/features/exams/types/exam-question-view.types";
import { createClient } from "@/lib/supabase/server";
import type { ExamQuestionType } from "@/types/database.types";

type ExamViewSummaryRow = {
  id: string;
  name: string;
  question_count: number;
  exam_start: string;
  exam_end: string;
  exam_duration_minutes: number;
  course: {
    id: string;
    name: string;
    deleted_at: string | null;
  };
};

type ExamQuestionViewRow = {
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

function mapExamQuestionViewItem(row: ExamQuestionViewRow, index: number): ExamQuestionViewItem {
  return {
    id: row.id,
    number: index + 1,
    questionType: row.question_type,
    question: row.question,
    choice1: row.choice1,
    choice2: row.choice2,
    choice3: row.choice3,
    choice4: row.choice4,
    choice5: row.choice5,
    answer: row.answer,
    score: row.score,
    sortOrder: row.sort_order,
  };
}

export async function getExamQuestionViewPage(
  examId: string,
): Promise<GetExamQuestionViewPageResult> {
  if (!examId.trim()) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const [examResult, questionsResult] = await Promise.all([
    supabase
      .from("exams")
      .select(EXAM_QUESTION_VIEW_SUMMARY_SELECT)
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

  const exam = examResult.data as ExamViewSummaryRow;
  const questions = ((questionsResult.data ?? []) as ExamQuestionViewRow[]).map(
    mapExamQuestionViewItem,
  );

  return {
    success: true,
    summary: {
      examId: exam.id,
      examName: exam.name,
      courseName: exam.course.name,
      examPeriod: formatExamPeriod(exam.exam_start, exam.exam_end),
      examDuration: formatExamDuration(exam.exam_duration_minutes),
      totalQuestionCount: exam.question_count,
    },
    questions,
    totals: calculateQuestionViewTotals(questions),
  };
}
