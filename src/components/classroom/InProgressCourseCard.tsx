import Link from "next/link";
import { PlayCircle } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import type { MyActiveEnrollment } from "@/features/enrollment-catalog/types/my-enrollments.types";
import { cn } from "@/lib/utils";

export function InProgressCourseCard({ course }: { course: MyActiveEnrollment }) {
  return (
    <div className={cn("border p-5 sm:p-6", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}>
      <div className="flex items-start justify-between gap-3">
        <h3 className={cn("text-[17px] font-bold", figmaClass.textPrimary)}>{course.courseTitle}</h3>
        <span
          className="inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
          style={{ backgroundColor: figma.colors.primary }}
        >
          학습중
        </span>
      </div>

      <p className={cn("mt-1.5 text-[13px]", figmaClass.textPlaceholder)}>{course.periodLabel}</p>
      <p className={cn("mt-1 text-[13px]", figmaClass.textMuted)}>담당교수 {course.managerName ?? "미정"}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className={cn("text-[13px] font-semibold", figmaClass.textSub)}>
          진도율 <span style={{ color: figma.colors.primary }}>{course.progressRate}%</span>
        </p>

        <Link
          href={`/classroom/${course.courseCode}`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-[13px] font-bold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: figma.colors.primary }}
        >
          <PlayCircle className="size-4" />
          학습 시작하기
        </Link>
      </div>
    </div>
  );
}
