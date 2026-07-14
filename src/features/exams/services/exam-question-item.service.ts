import { EXAM_QUESTION_ITEM_SELECT } from "@/features/exams/constants";
import type {
  ExamQuestionItemDeleteResult,
  ExamQuestionItemInput,
  ExamQuestionItemMutationResult,
  GetExamQuestionItemResult,
} from "@/features/exams/types/exam-question-item-form.types";
import { createClient } from "@/lib/supabase/server";
import type { Database, ExamQuestionType } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isQuestionType(value: string): value is ExamQuestionType {
  return value === "multiple_choice" || value === "ox" || value === "short_answer";
}

export function validateExamQuestionItemInput(
  input: ExamQuestionItemInput,
): ExamQuestionItemMutationResult {
  if (!isQuestionType(input.questionType)) {
    return {
      success: false,
      message: "문제유형을 선택해주세요.",
      field: "questionType",
    };
  }

  if (!normalize(input.question)) {
    return {
      success: false,
      message: "문제내용을 입력해주세요.",
      field: "question",
    };
  }

  const score = Number.parseInt(normalize(input.score), 10);
  if (Number.isNaN(score) || score < 0) {
    return {
      success: false,
      message: "올바른 배점을 입력해주세요.",
      field: "score",
    };
  }

  if (!normalize(input.answer)) {
    return {
      success: false,
      message: "정답을 입력해주세요.",
      field: "answer",
    };
  }

  if (input.questionType === "multiple_choice") {
    if (
      !normalize(input.choice1) ||
      !normalize(input.choice2) ||
      !normalize(input.choice3) ||
      !normalize(input.choice4)
    ) {
      return {
        success: false,
        message: "객관식 문제는 보기 1~4를 입력해주세요.",
        field: "choice1",
      };
    }

    if (!["1", "2", "3", "4", "5"].includes(normalize(input.answer))) {
      return {
        success: false,
        message: "정답은 1~5 중 하나를 입력해주세요.",
        field: "answer",
      };
    }
  }

  if (input.questionType === "ox") {
    const answer = normalize(input.answer).toUpperCase();
    if (answer !== "O" && answer !== "X") {
      return {
        success: false,
        message: "OX 문제의 정답은 O 또는 X를 입력해주세요.",
        field: "answer",
      };
    }
  }

  return { success: true, questionId: "", message: "" };
}

async function ensureExamExists(examId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .select("id")
    .eq("id", examId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}

async function getNextSortOrder(examId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_questions")
    .select("sort_order")
    .eq("exam_id", examId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.sort_order ?? 0) + 1;
}

export async function syncExamQuestionCount(examId: string) {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("exam_questions")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId)
    .is("deleted_at", null);

  if (countError) {
    throw new Error(countError.message);
  }

  const { error } = await supabase
    .from("exams")
    .update({ question_count: count ?? 0 })
    .eq("id", examId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

function buildInsertData(
  examId: string,
  input: ExamQuestionItemInput,
  sortOrder: number,
): Database["public"]["Tables"]["exam_questions"]["Insert"] {
  const answer =
    input.questionType === "ox" ? normalize(input.answer).toUpperCase() : normalize(input.answer);

  return {
    exam_id: examId,
    question_type: input.questionType,
    question: normalize(input.question),
    choice1:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice1) : null,
    choice2:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice2) : null,
    choice3:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice3) : null,
    choice4:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice4) : null,
    choice5:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice5) : null,
    answer,
    score: Number.parseInt(normalize(input.score), 10),
    sort_order: sortOrder,
  };
}

function buildUpdateData(
  input: ExamQuestionItemInput,
): Database["public"]["Tables"]["exam_questions"]["Update"] {
  const answer =
    input.questionType === "ox" ? normalize(input.answer).toUpperCase() : normalize(input.answer);

  return {
    question_type: input.questionType,
    question: normalize(input.question),
    choice1:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice1) : null,
    choice2:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice2) : null,
    choice3:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice3) : null,
    choice4:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice4) : null,
    choice5:
      input.questionType === "multiple_choice" ? emptyToNull(input.choice5) : null,
    answer,
    score: Number.parseInt(normalize(input.score), 10),
  };
}

function mapRowToInput(row: {
  id: string;
  question_type: ExamQuestionType;
  question: string;
  choice1: string | null;
  choice2: string | null;
  choice3: string | null;
  choice4: string | null;
  choice5: string | null;
  answer: string;
  score: number;
}): ExamQuestionItemInput & { id: string } {
  return {
    id: row.id,
    questionType: row.question_type,
    question: row.question,
    choice1: row.choice1 ?? "",
    choice2: row.choice2 ?? "",
    choice3: row.choice3 ?? "",
    choice4: row.choice4 ?? "",
    choice5: row.choice5 ?? "",
    answer: row.answer,
    score: String(row.score),
  };
}

export async function getExamQuestionItem(
  questionId: string,
): Promise<GetExamQuestionItemResult> {
  if (!questionId.trim()) {
    return { success: false, message: "문제 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_questions")
    .select(EXAM_QUESTION_ITEM_SELECT)
    .eq("id", questionId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "문제 정보를 찾을 수 없습니다." };
  }

  return { success: true, question: mapRowToInput(data) };
}

export async function createExamQuestionItem(
  examId: string,
  input: ExamQuestionItemInput,
): Promise<ExamQuestionItemMutationResult> {
  if (!examId.trim()) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const validation = validateExamQuestionItemInput(input);
  if (!validation.success) {
    return validation;
  }

  const exists = await ensureExamExists(examId);
  if (!exists) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const sortOrder = await getNextSortOrder(examId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_questions")
    .insert(buildInsertData(examId, input, sortOrder))
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await syncExamQuestionCount(examId);

  return {
    success: true,
    questionId: data.id,
    message: "문제가 등록되었습니다.",
  };
}

export async function updateExamQuestionItem(
  questionId: string,
  input: ExamQuestionItemInput,
): Promise<ExamQuestionItemMutationResult> {
  if (!questionId.trim()) {
    return { success: false, message: "문제 정보를 찾을 수 없습니다." };
  }

  const validation = validateExamQuestionItemInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("exam_questions")
    .select("id, exam_id")
    .eq("id", questionId)
    .is("deleted_at", null)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current) {
    return { success: false, message: "문제 정보를 찾을 수 없습니다." };
  }

  const { data, error } = await supabase
    .from("exam_questions")
    .update(buildUpdateData(input))
    .eq("id", questionId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "수정할 수 있는 문제가 없습니다." };
  }

  await syncExamQuestionCount(current.exam_id);

  return {
    success: true,
    questionId: data.id,
    message: "문제가 수정되었습니다.",
  };
}

export async function softDeleteExamQuestionItem(
  questionId: string,
): Promise<ExamQuestionItemDeleteResult> {
  if (!questionId.trim()) {
    return { success: false, message: "문제 정보를 찾을 수 없습니다." };
  }

  const deletedAt = new Date().toISOString();
  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase
    .from("exam_questions")
    .select("id, exam_id")
    .eq("id", questionId)
    .is("deleted_at", null)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current) {
    return { success: false, message: "삭제할 문제를 찾을 수 없습니다." };
  }

  const { data, error } = await supabase
    .from("exam_questions")
    .update({ deleted_at: deletedAt })
    .eq("id", questionId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "삭제할 문제를 찾을 수 없습니다." };
  }

  await syncExamQuestionCount(current.exam_id);

  return { success: true, message: "문제가 삭제되었습니다." };
}
