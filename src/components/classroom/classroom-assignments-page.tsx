import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { AssignmentListBoard } from "@/components/classroom/AssignmentListBoard";
import { getCourseAssignments } from "@/components/classroom/data/assignment-data";
import { getCourseLectureInfo } from "@/components/classroom/data/lecture-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

/**
 * 학습강의실 과제 목록 페이지. Mock data only for now — see
 * `src/components/classroom/data/assignment-data.ts` for the shape a
 * future `assignments` table would take.
 */
export function ClassroomAssignmentsPage({ slug }: { slug: string }) {
  const course = getCourseLectureInfo(slug);

  if (!course) {
    return (
      <ClassroomCourseShell courseTitle="학습강의실" slug={slug} breadcrumbLabel="과제">
        <div
          className={cn(
            "flex flex-col items-center gap-4 border px-6 py-24 text-center",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
            figmaClass.whiteBg,
          )}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-[#e5edff]">
            <AlertCircle className="size-6" style={{ color: figma.colors.primary }} />
          </div>
          <p className={cn("text-[16px] font-semibold", figmaClass.textPrimary)}>존재하지 않는 과정입니다.</p>
          <Link
            href="/classroom"
            className="mt-2 flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
            style={{ borderColor: figma.colors.border }}
          >
            학습강의실로 돌아가기
          </Link>
        </div>
      </ClassroomCourseShell>
    );
  }

  const assignments = getCourseAssignments(slug);

  return (
    <ClassroomCourseShell courseTitle={course.title} slug={slug} pageTitle={`${course.title} 과제`} breadcrumbLabel="과제">
      <AssignmentListBoard slug={slug} assignments={assignments} />
    </ClassroomCourseShell>
  );
}
