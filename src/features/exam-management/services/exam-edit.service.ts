import {
  deleteExamRecord,
  findExamById,
  updateExamRecord,
} from "@/features/exam-management/repositories/exam.repository";
import { validateExamInput } from "@/features/exam-management/services/exam-registration.service";
import { fetchExamCourseOptions } from "@/features/exam-management/services/exam-list.service";
import type {
  ExamDeleteResult,
  ExamEditInput,
  ExamEditResult,
  GetExamForEditResult,
} from "@/features/exam-management/types/exam.types";

export async function getExamForEdit(examId: string): Promise<GetExamForEditResult> {
  const exam = await findExamById(examId);

  if (!exam) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    exam: {
      id: exam.id,
      courseId: exam.courseId,
      courseName: exam.courseName,
      title: exam.title,
      durationMinutes: String(exam.durationMinutes),
      passScore: exam.passScore === null ? "" : String(exam.passScore),
      isPublished: exam.isPublished,
    },
  };
}

export async function updateExam(
  examId: string,
  input: ExamEditInput,
): Promise<ExamEditResult> {
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

  const updated = await updateExamRecord(examId, {
    courseId: course.id,
    title: parsed.title,
    durationMinutes: parsed.durationMinutes,
    passScore: parsed.passScore,
    isPublished: parsed.isPublished,
  });

  if (!updated) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: `"${updated.title}" 시험이 수정되었습니다.` };
}

export async function deleteExam(examId: string): Promise<ExamDeleteResult> {
  const exam = await findExamById(examId);

  if (!exam) {
    return { success: false, message: "삭제할 시험을 찾을 수 없습니다." };
  }

  await deleteExamRecord(examId);

  return { success: true, message: `"${exam.title}" 시험이 삭제되었습니다.` };
}
