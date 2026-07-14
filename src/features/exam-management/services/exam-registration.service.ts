import { fetchExamCourseOptions } from "@/features/exam-management/services/exam-list.service";
import { createExamRecord } from "@/features/exam-management/repositories/exam.repository";
import type {
  ExamRegistrationInput,
  ExamRegistrationResult,
} from "@/features/exam-management/types/exam.types";

function normalize(value: string) {
  return value.trim();
}

export type ParsedExamInput = {
  courseId: string;
  title: string;
  durationMinutes: number;
  passScore: number | null;
  isPublished: boolean;
};

/**
 * 민간자격증 LMS는 시험종류(항상 "최종시험")와 응시기간(학생 수강기간과 자동
 * 연동)을 입력받지 않으므로, 검증 대상은 과정/시험명/제한시간/합격점수뿐입니다.
 */
export function validateExamInput(
  input: ExamRegistrationInput,
): { field: keyof ExamRegistrationInput; message: string } | ParsedExamInput {
  if (!normalize(input.courseId)) {
    return { field: "courseId", message: "연결 과정을 선택해주세요." };
  }

  if (!normalize(input.title)) {
    return { field: "title", message: "시험명을 입력해주세요." };
  }

  const durationMinutes = Number(input.durationMinutes);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { field: "durationMinutes", message: "제한시간을 올바르게 입력해주세요." };
  }

  const passScoreRaw = normalize(input.passScore);
  const passScore = passScoreRaw === "" ? null : Number(passScoreRaw);
  if (passScore !== null && (!Number.isFinite(passScore) || passScore < 0 || passScore > 100)) {
    return { field: "passScore", message: "합격점수는 0~100 사이로 입력해주세요." };
  }

  return {
    courseId: normalize(input.courseId),
    title: normalize(input.title),
    durationMinutes,
    passScore,
    isPublished: input.isPublished,
  };
}

export async function createExam(
  input: ExamRegistrationInput,
): Promise<ExamRegistrationResult> {
  const parsed = validateExamInput(input);

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  const courses = await fetchExamCourseOptions();
  const course = courses.find((item) => item.id === parsed.courseId);

  if (!course) {
    return {
      success: false,
      message: "선택한 과정을 찾을 수 없습니다.",
      field: "courseId",
    };
  }

  const exam = await createExamRecord({
    courseId: course.id,
    title: parsed.title,
    durationMinutes: parsed.durationMinutes,
    passScore: parsed.passScore,
    isPublished: parsed.isPublished,
  });

  return {
    success: true,
    examId: exam.id,
    message: `"${exam.title}" 시험이 등록되었습니다.`,
  };
}
