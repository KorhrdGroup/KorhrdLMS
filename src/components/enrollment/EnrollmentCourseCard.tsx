"use client";

import { Check } from "lucide-react";
import Link from "next/link";

import { GovEmblem } from "@/components/home/gov-emblem";
import { figmaClass } from "@/components/home/home-design";
import { ENROLLMENT_CATALOG_DEFAULT_IMAGE } from "@/features/enrollment-catalog/constants";
import type { EnrollmentCatalogCourse } from "@/features/enrollment-catalog/types/enrollment-catalog.types";
import { cn } from "@/lib/utils";

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 민간자격증 LMS는 붉은 테두리의 "마감임박" 배지 1종만 사용합니다(과정관리에서 ON/OFF). */
const DEADLINE_BADGE_CLASS = "border-[#e5433f]/40 bg-[#e5433f]/5 text-[#e5433f]";

export function EnrollmentCourseCard({
  course,
  selected,
  onToggle,
}: {
  course: EnrollmentCatalogCourse;
  selected: boolean;
  onToggle: () => void;
}) {
  const hasDiscount = course.regularPrice > course.displayPrice;

  return (
    <article
      className={cn(
        "flex flex-col gap-5 border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:flex-row",
        figmaClass.roundedCard,
        figmaClass.borderDefault,
      )}
    >
      <Link
        href={`/courses/${course.slug}`}
        className="group/thumb relative h-[200px] w-full shrink-0 cursor-pointer overflow-hidden rounded-lg sm:h-auto sm:w-[260px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.thumbnailUrl || ENROLLMENT_CATALOG_DEFAULT_IMAGE}
          alt={course.title}
          className="size-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/thumb:bg-black/10" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/95 py-0.5 pr-2 pl-1 shadow-sm">
          <GovEmblem className="size-4" />
          <span className="text-[10px] font-semibold text-[#1d1d1d]">국가지정기관</span>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("text-[21px] font-extrabold", figmaClass.textPrimary)}>
              <Link
                href={`/courses/${course.slug}`}
                className="cursor-pointer transition-colors duration-200 hover:text-[#00376e] hover:underline hover:decoration-2 hover:underline-offset-2"
              >
                {course.title}
              </Link>
              {course.suffix ? (
                <span className={cn("ml-1 text-[14px] font-medium", figmaClass.textPlaceholder)}>
                  {course.suffix}
                </span>
              ) : null}
            </h3>
            {course.badge ? (
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
                  DEADLINE_BADGE_CLASS,
                )}
              >
                [{course.badge.label}]
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-0.5">
            {hasDiscount ? (
              <span className="text-[12px] font-medium text-[#9ca3af] line-through">
                {formatWon(course.regularPrice)}
              </span>
            ) : null}
            <span className="text-[15px] font-bold text-[#1257ee]">
              {formatWon(course.displayPrice)}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[13px]">
          <div className="flex gap-2">
            <dt className={figmaClass.textPlaceholder}>담당교수</dt>
            <dd className={figmaClass.textBody}>{course.professorName ?? "미정"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className={figmaClass.textPlaceholder}>수업방식</dt>
            <dd className={figmaClass.textBody}>{course.studyMethod}</dd>
          </div>
          <div className="flex gap-2">
            <dt className={figmaClass.textPlaceholder}>강의시간</dt>
            <dd className={figmaClass.textBody}>{course.lectureTime}</dd>
          </div>
          <div className="flex gap-2">
            <dt className={figmaClass.textPlaceholder}>주무관청</dt>
            <dd className={figmaClass.textBody}>{course.supervisingAgency}</dd>
          </div>
        </dl>
      </div>

      <div className="flex shrink-0 flex-row gap-2.5 sm:w-[150px] sm:flex-col sm:justify-center">
        <button
          type="button"
          onClick={() => window.alert(`[Mock] ${course.title} 상담신청이 접수되었습니다.`)}
          className={cn(
            "flex h-11 flex-1 items-center justify-center rounded-lg border text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e] sm:flex-none",
            figmaClass.textSub,
            figmaClass.borderDefault,
          )}
        >
          상담신청하기
        </button>
        <button
          type="button"
          onClick={() => window.alert(`[Mock] ${course.title} 강의샘플은 준비 중입니다.`)}
          className={cn(
            "flex h-11 flex-1 items-center justify-center rounded-lg border text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e] sm:flex-none",
            figmaClass.textSub,
            figmaClass.borderDefault,
          )}
        >
          강의샘플보기
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold text-white transition-all duration-200 hover:brightness-110 sm:flex-none",
            selected ? "bg-[#00376e]" : "bg-[#1257ee]",
          )}
        >
          과목 선택하기
          <span
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded border transition-all duration-200",
              selected ? "border-white bg-white" : "border-white/60 bg-white/10",
            )}
          >
            {selected ? <Check className="size-3 text-[#00376e]" strokeWidth={3} /> : null}
          </span>
        </button>
      </div>
    </article>
  );
}
