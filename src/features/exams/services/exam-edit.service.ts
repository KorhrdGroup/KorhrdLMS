import { EXAM_EDIT_SELECT } from "@/features/exams/constants";
import type {
  ExamEditDetail,
  ExamEditInput,
  ExamEditResult,
  GetExamForEditResult,
} from "@/features/exams/types/exam-edit.types";
import { createClient } from "@/lib/supabase/server";
import type { Database, ExamStatus } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseNonNegativeInteger(
  value: string,
  field: keyof ExamEditInput,
  label: string,
): ExamEditResult | number {
  const trimmed = normalize(value);

  if (!trimmed) {
    return {
      success: false,
      message: `${label}을(를) 입력해주세요.`,
      field,
    };
  }

  const parsed = Number.parseInt(trimmed, 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    return {
      success: false,
      message: `올바른 ${label}을(를) 입력해주세요.`,
      field,
    };
  }

  return parsed;
}

function validateDateField(
  value: string,
  field: keyof ExamEditInput,
  label: string,
): ExamEditResult | null {
  if (!normalize(value)) {
    return {
      success: false,
      message: `${label}을(를) 입력해주세요.`,
      field,
    };
  }

  if (Number.isNaN(Date.parse(value))) {
    return {
      success: false,
      message: `올바른 ${label}을(를) 입력해주세요.`,
      field,
    };
  }

  return null;
}

export function validateExamEditInput(input: ExamEditInput): ExamEditResult {
  if (!normalize(input.name)) {
    return {
      success: false,
      message: "시험명을 입력해주세요.",
      field: "name",
    };
  }

  const examStartError = validateDateField(input.examStart, "examStart", "응시 시작일");
  if (examStartError) {
    return examStartError;
  }

  const examEndError = validateDateField(input.examEnd, "examEnd", "응시 종료일");
  if (examEndError) {
    return examEndError;
  }

  if (input.examEnd < input.examStart) {
    return {
      success: false,
      message: "응시 종료일은 시작일 이후여야 합니다.",
      field: "examEnd",
    };
  }

  const questionCount = parseNonNegativeInteger(
    input.questionCount,
    "questionCount",
    "문제수",
  );
  if (typeof questionCount !== "number") {
    return questionCount;
  }

  const examDurationMinutes = parseNonNegativeInteger(
    input.examDurationMinutes,
    "examDurationMinutes",
    "시험시간",
  );
  if (typeof examDurationMinutes !== "number") {
    return examDurationMinutes;
  }

  if (input.status !== "planned" && input.status !== "confirmed") {
    return {
      success: false,
      message: "상태를 선택해주세요.",
      field: "status",
    };
  }

  return { success: true, message: "" };
}

type ExamEditRow = {
  id: string;
  year: number;
  name: string;
  exam_kind: ExamEditDetail["examKind"];
  exam_type: ExamEditDetail["examType"];
  exam_start: string;
  exam_end: string;
  question_count: number;
  exam_duration_minutes: number;
  status: ExamStatus;
  memo: string | null;
  course: {
    id: string;
    name: string;
    code: string;
    deleted_at: string | null;
  };
};

function mapExamEditDetail(row: ExamEditRow): ExamEditDetail {
  return {
    id: row.id,
    year: row.year,
    courseName: row.course.name,
    examKind: row.exam_kind,
    examType: row.exam_type,
    name: row.name,
    examStart: row.exam_start,
    examEnd: row.exam_end,
    questionCount: row.question_count,
    examDurationMinutes: row.exam_duration_minutes,
    status: row.status,
    memo: row.memo,
  };
}

export async function getExamForEdit(examId: string): Promise<GetExamForEditResult> {
  if (!examId.trim()) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .select(EXAM_EDIT_SELECT)
    .eq("id", examId)
    .is("deleted_at", null)
    .is("course.deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    exam: mapExamEditDetail(data as ExamEditRow),
  };
}

export async function updateExam(
  examId: string,
  input: ExamEditInput,
): Promise<ExamEditResult> {
  if (!examId.trim()) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const validation = validateExamEditInput(input);
  if (!validation.success) {
    return validation;
  }

  const questionCount = Number.parseInt(normalize(input.questionCount), 10);
  const examDurationMinutes = Number.parseInt(
    normalize(input.examDurationMinutes),
    10,
  );

  const supabase = await createClient();

  const updateData: Database["public"]["Tables"]["exams"]["Update"] = {
    name: normalize(input.name),
    exam_start: input.examStart,
    exam_end: input.examEnd,
    question_count: questionCount,
    exam_duration_minutes: examDurationMinutes,
    status: input.status,
    memo: emptyToNull(input.memo),
  };

  const { data, error } = await supabase
    .from("exams")
    .update(updateData)
    .eq("id", examId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "수정할 수 있는 시험 정보가 없습니다." };
  }

  return { success: true, message: "시험 정보가 수정되었습니다." };
}
