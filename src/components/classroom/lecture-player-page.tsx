import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { LecturePlayerBoard } from "@/components/classroom/LecturePlayerBoard";
import { figma, figmaClass } from "@/components/home/home-design";
import type { ClassroomLectureDetail } from "@/features/classroom-lectures/types/classroom-lecture.types";
import { cn } from "@/lib/utils";

/**
 * 강의 상세(차시 재생) 화면 — `detail`은 course_lectures/lecture_sessions
 * 기준으로 실제 조회한 차시입니다(존재하지 않거나 접근 권한이 없으면 null).
 * 실제 영상 재생은 다음 단계이며, 지금은 "학습 완료" 버튼으로 진도를 기록합니다.
 */
export function LecturePlayerPage({
  slug,
  detail,
}: {
  slug: string;
  detail: ClassroomLectureDetail | null;
}) {
  if (!detail) {
    return (
      <ClassroomCourseShell courseTitle="학습강의실" slug={slug} breadcrumbLabel="강의">
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
          <p className={cn("text-[16px] font-semibold", figmaClass.textPrimary)}>존재하지 않는 강의입니다.</p>
          <Link
            href={`/classroom/${slug}`}
            className="mt-2 flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
            style={{ borderColor: figma.colors.border }}
          >
            강의목록으로 돌아가기
          </Link>
        </div>
      </ClassroomCourseShell>
    );
  }

  return (
    <ClassroomCourseShell
      courseTitle={detail.courseTitle}
      slug={slug}
      breadcrumbLabel={`${detail.session.order}차시`}
    >
      <LecturePlayerBoard
        slug={slug}
        courseTitle={detail.courseTitle}
        session={detail.session}
        prevOrder={detail.prevOrder}
        nextOrder={detail.nextOrder}
      />
    </ClassroomCourseShell>
  );
}
