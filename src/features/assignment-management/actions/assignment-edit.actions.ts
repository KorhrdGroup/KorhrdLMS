"use server";

import {
  deleteAssignment,
  getAssignmentForEdit,
  updateAssignment,
} from "@/features/assignment-management/services/assignment-edit.service";
import type {
  AssignmentDeleteResult,
  AssignmentEditInput,
  AssignmentEditResult,
  GetAssignmentForEditResult,
} from "@/features/assignment-management/types/assignment.types";

export async function getAssignmentForEditAction(
  assignmentId: string,
): Promise<GetAssignmentForEditResult> {
  return getAssignmentForEdit(assignmentId);
}

export async function updateAssignmentAction(
  assignmentId: string,
  input: AssignmentEditInput,
): Promise<AssignmentEditResult> {
  return updateAssignment(assignmentId, input);
}

export async function deleteAssignmentAction(
  assignmentId: string,
): Promise<AssignmentDeleteResult> {
  return deleteAssignment(assignmentId);
}
