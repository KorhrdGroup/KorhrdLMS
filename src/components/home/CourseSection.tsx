"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRef } from "react";

import type { CourseCardItem } from "@/components/home/data/home-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { GovEmblem } from "@/components/home/gov-emblem";
import { HomeContainer } from "@/components/home/home-container";
import { cn } from "@/lib/utils";

export function HomeCourseCard({
  course,
  className,
}: {
  course: CourseCardItem;
  className?: string;
}) {
  return (
    <article
      className={cn("group cursor-pointer", className)}
      style={
        className?.includes("w-full")
          ? undefined
          : { width: figma.layout.courseCardWidth, flexShrink: 0 }
      }
    >
      <div
        className="relative overflow-hidden transition-all duration-200 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
        style={{ height: figma.layout.courseImageHeight, borderRadius: figma.radius.image }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.image}
          alt={course.title}
          className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.05]"
        />
        {course.ministry ? (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/95 py-0.5 pr-2 pl-1 shadow-sm">
            <GovEmblem className="size-4" />
            <span className="text-[10px] font-semibold text-[#1d1d1d]">{course.ministry}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col">
        <Link
          href="#"
          className={cn(
            "flex h-[18px] items-center text-[13px] leading-[18px] transition-colors duration-200 group-hover:text-[#00376e]",
            figmaClass.textPlaceholder,
          )}
        >
          <span className="line-clamp-1">{course.category}</span>
          <ChevronRight className="size-3.5 shrink-0" />
        </Link>
        <h3
          className={cn(
            "mt-1 line-clamp-1 h-[23px]",
            figma.typography.courseCardTitle,
            figmaClass.textPrimary,
            "transition-colors duration-200 group-hover:text-[#00376e]",
          )}
        >
          {course.title}
        </h3>
      </div>
    </article>
  );
}

export type CourseSectionProps = {
  title: string;
  courses: CourseCardItem[];
  bgClassName?: string;
};

export function CourseSection({ title, courses, bgClassName = "bg-white" }: CourseSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = figma.layout.courseCardWidth + figma.layout.courseCardGap;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    el.scrollTo({
      left: atEnd ? 0 : el.scrollLeft + cardWidth * 2,
      behavior: "smooth",
    });
  };

  return (
    <section className={bgClassName} style={{ padding: `${figma.spacing.courseSection}px 0` }}>
      <HomeContainer>
        <h2 className={cn(figma.typography.sectionTitle, "mb-5", figmaClass.textPrimary)}>{title}</h2>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex scroll-smooth overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ gap: figma.layout.courseCardGap }}
          >
            {courses.map((course) => (
              <HomeCourseCard key={course.id} course={course} />
            ))}
          </div>

          <button
            type="button"
            aria-label="다음 과정 보기"
            onClick={handleNext}
            className="absolute top-[94px] -right-8 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#333333] shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-right-10 hover:bg-[#00376e] hover:text-white sm:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </HomeContainer>
    </section>
  );
}
