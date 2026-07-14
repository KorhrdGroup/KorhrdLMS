import { ClassroomBoard } from "@/components/classroom/ClassroomBoard";
import { ClassroomShell } from "@/components/classroom/ClassroomShell";
import type {
  MyActiveEnrollment,
  MyPendingEnrollment,
} from "@/features/enrollment-catalog/types/my-enrollments.types";

export function ClassroomPage({
  pendingEnrollments,
  activeEnrollments,
}: {
  pendingEnrollments: MyPendingEnrollment[];
  activeEnrollments: MyActiveEnrollment[];
}) {
  return (
    <ClassroomShell>
      <ClassroomBoard pendingEnrollments={pendingEnrollments} activeEnrollments={activeEnrollments} />
    </ClassroomShell>
  );
}
