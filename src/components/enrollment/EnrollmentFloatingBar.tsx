"use client";

import { X } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import { HomeContainer } from "@/components/home/home-container";
import type { EnrollmentCatalogCourse } from "@/features/enrollment-catalog/types/enrollment-catalog.types";
import { cn } from "@/lib/utils";

export function EnrollmentFloatingBar({
  courses,
  onRemove,
  onSubmit,
  submitting = false,
}: {
  courses: EnrollmentCatalogCourse[];
  onRemove: (id: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
}) {
  const visible = courses.length > 0;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-white transition-transform duration-300",
        figmaClass.borderDefault,
        visible ? "translate-y-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" : "translate-y-full",
      )}
      aria-hidden={!visible}
    >
      <HomeContainer className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <p className="shrink-0 text-[15px] font-bold whitespace-nowrap text-[#1d1d1d]">
            선택한 과목 <span style={{ color: figma.colors.primary }}>{courses.length}</span>개
          </p>
          <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {courses.map((course) => (
              <span
                key={course.id}
                className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#f4f8ff] py-1.5 pr-2 pl-4 text-[13px] font-medium whitespace-nowrap text-[#00376e]"
              >
                {course.title}
                {course.suffix}
                <button
                  type="button"
                  aria-label={`${course.title} 선택 해제`}
                  onClick={() => onRemove(course.id)}
                  className="flex size-5 items-center justify-center rounded-full bg-[#00376e]/10 transition-colors duration-200 hover:bg-[#00376e]/25"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-5 border-t border-[#eee] pt-4 lg:justify-end lg:border-t-0 lg:pt-0">
          <p className={cn("text-[13px]", figmaClass.textPlaceholder)}>수강료는 상담 후 안내드립니다</p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!visible || submitting}
            className="h-12 shrink-0 rounded-lg px-7 text-[15px] font-bold whitespace-nowrap text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: figma.colors.primary }}
          >
            {submitting ? "신청 처리 중..." : "선택과목 수강신청"}
          </button>
        </div>
      </HomeContainer>
    </div>
  );
}
