import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { LectureListBoard } from "@/components/classroom/LectureListBoard";
import type { ClassroomCourseLectures } from "@/features/classroom-lectures/types/classroom-lecture.types";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

/**
 * 강의 목록/출석 페이지 — shown after clicking "강의 시청하기" from the
 * 학습강의실 dashboard. `course`는 `courses.code`(slug) 기준으로 관리자가
 * 등록·게시한 차시(course_lectures + lecture_sessions)를 조회한 결과입니다.
 * (수강 승인되지 않은 과정이거나 존재하지 않는 과정 코드면 null입니다.)
 */
export function ClassroomCoursePage({
  slug,
  course,
}: {
  slug: string;
  course: ClassroomCourseLectures | null;
}) {
  if (!course) {
    return (
      <ClassroomCourseShell courseTitle="학습강의실" slug={slug} breadcrumbLabel="강의목록">
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

  return (
    <ClassroomCourseShell courseTitle={course.courseTitle} slug={slug}>
      <LectureListBoard slug={slug} sessions={course.sessions} />
    </ClassroomCourseShell>
  );
}
