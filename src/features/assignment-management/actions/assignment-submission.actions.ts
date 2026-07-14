"use server";

import {
  gradeSubmission,
  getAssignmentSubmissions,
} from "@/features/assignment-management/services/assignment-submission.service";
import type {
  GetAssignmentSubmissionsResult,
  SubmissionGradeInput,
  SubmissionGradeResult,
} from "@/features/assignment-management/types/assignment-submission.types";

export async function getAssignmentSubmissionsAction(
  assignmentId: string,
): Promise<GetAssignmentSubmissionsResult> {
  return getAssignmentSubmissions(assignmentId);
}

export async function gradeSubmissionAction(
  assignmentId: string,
  submissionId: string,
  input: SubmissionGradeInput,
): Promise<SubmissionGradeResult> {
  return gradeSubmission(assignmentId, submissionId, input);
}
