"use client";

import { CalendarCheck2, ClipboardCheck, FileCheck2, GraduationCap } from "lucide-react";

import { figmaClass } from "@/components/home/home-design";
import type { MyActiveEnrollment } from "@/features/enrollment-catalog/types/my-enrollments.types";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { label: "출석확인", icon: CalendarCheck2 },
  { label: "과제 확인", icon: ClipboardCheck },
  { label: "시험확인", icon: FileCheck2 },
  { label: "성적확인", icon: GraduationCap },
] as const;

export function CompletedCourseCard({ course }: { course: MyActiveEnrollment }) {
  return (
    <div className={cn("border p-5 sm:p-6", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}>
      <div className="flex items-start justify-between gap-3">
        <h3 className={cn("text-[17px] font-bold", figmaClass.textPrimary)}>{course.courseTitle}</h3>
        <span className="inline-flex shrink-0 rounded-full bg-[#ff8a00] px-2.5 py-1 text-[11px] font-bold text-white">
          수강완료
        </span>
      </div>

      <p className={cn("mt-1.5 text-[13px]", figmaClass.textPlaceholder)}>{course.periodLabel}</p>
      <p className={cn("mt-1 text-[13px]", figmaClass.textMuted)}>담당교수 {course.managerName ?? "미정"}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTIONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => window.alert(`[Mock] ${label} 페이지를 준비 중입니다.`)}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-lg border text-[12px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
              figmaClass.textSub,
              figmaClass.borderDefault,
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
