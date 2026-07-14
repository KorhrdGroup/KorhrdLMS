import type { ExamQuestionMoveDirection } from "@/features/exam-management/types/exam-question-form.types";
import { FINAL_EXAM_KIND } from "@/features/exam-management/constants";
import type {
  Exam,
  ExamKind,
  ExamQuestion,
  ExamQuestionAnswer,
} from "@/features/exam-management/types/exam.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * 시험관리(/admin/exams) Repository 계층입니다.
 *
 * Supabase `exams` / `exam_questions` 테이블을 직접 조회/변경합니다.
 * 서비스 계층(services/*)은 이 파일이 export하는 함수 시그니처만 바라보므로,
 * 추후 스키마가 바뀌어도 이 파일 내부만 수정하면 됩니다.
 */

type ExamRow = Database["public"]["Tables"]["exams"]["Row"];
type QuestionRow = Database["public"]["Tables"]["exam_questions"]["Row"];
type CourseRow = { id: string; name: string };

const EXAM_WITH_COURSE_SELECT = `
  id,
  course_id,
  year,
  name,
  exam_kind,
  exam_duration_minutes,
  pass_score,
  is_published,
  created_at,
  course:courses!inner ( id, name )
` as const;

type ExamWithCourseRow = Pick<
  ExamRow,
  | "id"
  | "course_id"
  | "year"
  | "name"
  | "exam_kind"
  | "exam_duration_minutes"
  | "pass_score"
  | "is_published"
  | "created_at"
> & { course: CourseRow };

function toAnswer(answer: string): ExamQuestionAnswer {
  return (["1", "2", "3", "4"].includes(answer) ? answer : "1") as ExamQuestionAnswer;
}

function toQuestion(row: QuestionRow): ExamQuestion {
  return {
    id: row.id,
    order: row.sort_order,
    question: row.question,
    choice1: row.choice1 ?? "",
    choice2: row.choice2 ?? "",
    choice3: row.choice3 ?? "",
    choice4: row.choice4 ?? "",
    answer: toAnswer(row.answer),
    score: row.score,
  };
}

async function attachQuestions(supabase: Awaited<ReturnType<typeof createClient>>, examId: string) {
  const { data, error } = await supabase
    .from("exam_questions")
    .select("id, exam_id, question_type, question, choice1, choice2, choice3, choice4, choice5, answer, score, sort_order, deleted_at, created_at, updated_at")
    .eq("exam_id", examId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as QuestionRow[]).map(toQuestion);
}

function toExam(row: ExamWithCourseRow, questions: ExamQuestion[]): Exam {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course.name,
    title: row.name,
    examKind: row.exam_kind as ExamKind,
    durationMinutes: row.exam_duration_minutes,
    passScore: row.pass_score,
    isPublished: row.is_published,
    createdAt: row.created_at,
    questions,
  };
}

export async function listExams(): Promise<Exam[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .select(EXAM_WITH_COURSE_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as ExamWithCourseRow[];

  return Promise.all(
    rows.map(async (row) => toExam(row, await attachQuestions(supabase, row.id))),
  );
}

export async function findExamById(examId: string): Promise<Exam | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .select(EXAM_WITH_COURSE_SELECT)
    .eq("id", examId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return undefined;
  }

  const row = data as unknown as ExamWithCourseRow;
  return toExam(row, await attachQuestions(supabase, row.id));
}

export async function createExamRecord(
  input: Omit<Exam, "id" | "createdAt" | "questions" | "courseName" | "examKind">,
): Promise<Exam> {
  const supabase = await createClient();

  const insertData: Database["public"]["Tables"]["exams"]["Insert"] = {
    course_id: input.courseId,
    year: new Date().getFullYear(),
    name: input.title,
    exam_kind: FINAL_EXAM_KIND,
    exam_type: "regular",
    exam_start: null,
    exam_end: null,
    exam_duration_minutes: input.durationMinutes,
    pass_score: input.passScore,
    is_published: input.isPublished,
    question_count: 0,
  };

  const { data, error } = await supabase
    .from("exams")
    .insert(insertData)
    .select(EXAM_WITH_COURSE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toExam(data as unknown as ExamWithCourseRow, []);
}

export async function updateExamRecord(
  examId: string,
  patch: Partial<Omit<Exam, "id" | "questions" | "createdAt" | "courseName" | "examKind">>,
): Promise<Exam | undefined> {
  const supabase = await createClient();

  const updateData: Database["public"]["Tables"]["exams"]["Update"] = {};
  if (patch.courseId !== undefined) updateData.course_id = patch.courseId;
  if (patch.title !== undefined) updateData.name = patch.title;
  if (patch.durationMinutes !== undefined) updateData.exam_duration_minutes = patch.durationMinutes;
  if (patch.passScore !== undefined) updateData.pass_score = patch.passScore;
  if (patch.isPublished !== undefined) updateData.is_published = patch.isPublished;

  const { data, error } = await supabase
    .from("exams")
    .update(updateData)
    .eq("id", examId)
    .is("deleted_at", null)
    .select(EXAM_WITH_COURSE_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return undefined;
  }

  const row = data as unknown as ExamWithCourseRow;
  return toExam(row, await attachQuestions(supabase, row.id));
}

export async function deleteExamRecord(examId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", examId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function findQuestionById(
  examId: string,
  questionId: string,
): Promise<ExamQuestion | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_questions")
    .select("id, exam_id, question_type, question, choice1, choice2, choice3, choice4, choice5, answer, score, sort_order, deleted_at, created_at, updated_at")
    .eq("id", questionId)
    .eq("exam_id", examId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toQuestion(data as QuestionRow) : undefined;
}

type QuestionInput = {
  question: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  answer: ExamQuestionAnswer;
  score: number;
};

async function syncQuestionCount(supabase: Awaited<ReturnType<typeof createClient>>, examId: string) {
  const { count, error } = await supabase
    .from("exam_questions")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("exams")
    .update({ question_count: count ?? 0 })
    .eq("id", examId);
}

export async function addQuestionRecord(
  examId: string,
  input: QuestionInput,
): Promise<ExamQuestion | undefined> {
  const supabase = await createClient();

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("id")
    .eq("id", examId)
    .is("deleted_at", null)
    .maybeSingle();

  if (examError) {
    throw new Error(examError.message);
  }

  if (!exam) {
    return undefined;
  }

  const existing = await attachQuestions(supabase, examId);
  const nextOrder = existing.length + 1;

  const insertData: Database["public"]["Tables"]["exam_questions"]["Insert"] = {
    exam_id: examId,
    question_type: "multiple_choice",
    question: input.question,
    choice1: input.choice1,
    choice2: input.choice2,
    choice3: input.choice3,
    choice4: input.choice4,
    answer: input.answer,
    score: input.score,
    sort_order: nextOrder,
  };

  const { data, error } = await supabase
    .from("exam_questions")
    .insert(insertData)
    .select("id, exam_id, question_type, question, choice1, choice2, choice3, choice4, choice5, answer, score, sort_order, deleted_at, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await syncQuestionCount(supabase, examId);

  return toQuestion(data as QuestionRow);
}

export async function updateQuestionRecord(
  examId: string,
  questionId: string,
  input: QuestionInput,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_questions")
    .update({
      question: input.question,
      choice1: input.choice1,
      choice2: input.choice2,
      choice3: input.choice3,
      choice4: input.choice4,
      answer: input.answer,
      score: input.score,
    })
    .eq("id", questionId)
    .eq("exam_id", examId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function deleteQuestionRecord(examId: string, questionId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: deleted, error: deleteError } = await supabase
    .from("exam_questions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", questionId)
    .eq("exam_id", examId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!deleted) {
    return false;
  }

  const remaining = await attachQuestions(supabase, examId);
  await Promise.all(
    remaining.map((question, index) =>
      supabase
        .from("exam_questions")
        .update({ sort_order: index + 1 })
        .eq("id", question.id),
    ),
  );

  await syncQuestionCount(supabase, examId);

  return true;
}

export async function moveQuestionRecord(
  examId: string,
  questionId: string,
  direction: ExamQuestionMoveDirection,
): Promise<boolean> {
  const supabase = await createClient();
  const questions = await attachQuestions(supabase, examId);
  const index = questions.findIndex((question) => question.id === questionId);

  if (index === -1) {
    return false;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= questions.length) {
    return false;
  }

  const current = questions[index];
  const target = questions[targetIndex];

  const { error: errorA } = await supabase
    .from("exam_questions")
    .update({ sort_order: target.order })
    .eq("id", current.id);

  if (errorA) {
    throw new Error(errorA.message);
  }

  const { error: errorB } = await supabase
    .from("exam_questions")
    .update({ sort_order: current.order })
    .eq("id", target.id);

  if (errorB) {
    throw new Error(errorB.message);
  }

  return true;
}
