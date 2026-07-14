import type {
  AssignmentSubmission,
} from "@/features/assignment-management/types/assignment.types";

export type AssignmentSubmissionSummary = {
  assignmentId: string;
  assignmentTitle: string;
  courseName: string;
  isPublished: boolean;
  submissionStart: string;
  submissionEnd: string;
  submissionCount: number;
  gradedCount: number;
};

export type GetAssignmentSubmissionsResult =
  | { success: true; summary: AssignmentSubmissionSummary; submissions: AssignmentSubmission[] }
  | { success: false; message: string };

export type SubmissionGradeInput = {
  score: string;
  feedback: string;
  markGraded: boolean;
};

export type SubmissionGradeResult =
  | { success: true; message: string; field?: keyof SubmissionGradeInput }
  | { success: false; message: string; field?: keyof SubmissionGradeInput };
