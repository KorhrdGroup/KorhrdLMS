import {
  findAssignmentById,
  findSubmissionById,
  updateSubmissionRecord,
} from "@/features/assignment-management/repositories/assignment.repository";
import type {
  GetAssignmentSubmissionsResult,
  SubmissionGradeInput,
  SubmissionGradeResult,
} from "@/features/assignment-management/types/assignment-submission.types";

export async function getAssignmentSubmissions(
  assignmentId: string,
): Promise<GetAssignmentSubmissionsResult> {
  const assignment = findAssignmentById(assignmentId);

  if (!assignment) {
    return { success: false, message: "과제 정보를 찾을 수 없습니다." };
  }

  const submissions = [...assignment.submissions].sort(
    (a, b) => (a.submittedAt < b.submittedAt ? -1 : 1),
  );

  return {
    success: true,
    summary: {
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      courseName: assignment.courseName,
      isPublished: assignment.isPublished,
      submissionStart: assignment.submissionStart,
      submissionEnd: assignment.submissionEnd,
      submissionCount: submissions.length,
      gradedCount: submissions.filter((s) => s.status === "graded").length,
    },
    submissions,
  };
}

export async function gradeSubmission(
  assignmentId: string,
  submissionId: string,
  input: SubmissionGradeInput,
): Promise<SubmissionGradeResult> {
  const submission = findSubmissionById(assignmentId, submissionId);

  if (!submission) {
    return { success: false, message: "제출 정보를 찾을 수 없습니다." };
  }

  const score = Number(input.score);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return { success: false, message: "점수는 0~100 사이로 입력해주세요.", field: "score" };
  }

  const feedback = input.feedback.trim();

  const ok = updateSubmissionRecord(assignmentId, submissionId, {
    score,
    feedback: feedback || null,
    status: input.markGraded ? "graded" : "submitted",
  });

  if (!ok) {
    return { success: false, message: "제출 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    message: input.markGraded
      ? "채점이 완료되어 저장되었습니다."
      : "점수와 피드백이 임시 저장되었습니다.",
  };
}
