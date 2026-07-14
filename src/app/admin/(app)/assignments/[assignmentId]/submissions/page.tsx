import { notFound } from "next/navigation";

import { AssignmentSubmissionManageView } from "@/features/assignment-management/components/assignment-submission-manage-view";
import { getAssignmentSubmissions } from "@/features/assignment-management/services/assignment-submission.service";

type AssignmentSubmissionsPageProps = {
  params: Promise<{ assignmentId: string }>;
};

export default async function AssignmentSubmissionsPage({
  params,
}: AssignmentSubmissionsPageProps) {
  const { assignmentId } = await params;
  const result = await getAssignmentSubmissions(assignmentId);

  if (!result.success) {
    notFound();
  }

  return (
    <AssignmentSubmissionManageView
      summary={result.summary}
      submissions={result.submissions}
    />
  );
}
