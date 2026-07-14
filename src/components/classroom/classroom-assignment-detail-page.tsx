import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { AssignmentDetailBoard } from "@/components/classroom/AssignmentDetailBoard";
import { getCourseAssignment } from "@/components/classroom/data/assignment-data";
import { getCourseLectureInfo } from "@/components/classroom/data/lecture-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function ClassroomAssignmentDetailPage({ slug, id }: { slug: string; id: string }) {
  const course = getCourseLectureInfo(slug);
  const assignment = course ? getCourseAssignment(slug, id) : null;

  if (!course || !assignment) {
    return (
      <ClassroomCourseShell courseTitle={course?.title ?? "학습강의실"} slug={slug} breadcrumbLabel="과제">
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
          <p className={cn("text-[16px] font-semibold", figmaClass.textPrimary)}>존재하지 않는 과제입니다.</p>
          <Link
            href={course ? `/classroom/${slug}/assignments` : "/classroom"}
            className="mt-2 flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
            style={{ borderColor: figma.colors.border }}
          >
            {course ? "과제 목록으로 돌아가기" : "학습강의실로 돌아가기"}
          </Link>
        </div>
      </ClassroomCourseShell>
    );
  }

  return (
    <ClassroomCourseShell courseTitle={course.title} slug={slug} pageTitle={`${course.title} 과제`} breadcrumbLabel="과제">
      <AssignmentDetailBoard slug={slug} assignment={assignment} />
    </ClassroomCourseShell>
  );
}
