"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import { QuickContactPanel } from "@/components/shared/QuickContactPanel";
import { cn } from "@/lib/utils";

export type CourseMenuId = "exam" | "grades" | "materials" | "notices";

/**
 * Course-specific left menu shown on 강의 목록/출석, 시험, 성적보기,
 * 학습자료실, 공지사항 and other course sub pages.
 */
export function CourseSideMenu({
  courseTitle,
  slug,
  activeId = "exam",
}: {
  courseTitle: string;
  slug: string;
  activeId?: CourseMenuId;
}) {
  const items: { id: CourseMenuId; label: string; href?: string }[] = [
    { id: "exam", label: `${courseTitle} 시험`, href: `/classroom/${slug}/exam` },
    { id: "grades", label: "성적보기", href: `/classroom/${slug}/grades` },
    { id: "materials", label: "학습자료실", href: `/classroom/${slug}/materials` },
    { id: "notices", label: "공지사항", href: `/classroom/${slug}/notices` },
  ];

  return (
    <aside className="w-full shrink-0 lg:w-[230px]">
      <nav className={cn("overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {items.map((item) => {
          const active = item.id === activeId;
          const className = cn(
            "flex w-full items-center justify-between px-4 py-4 text-left text-[14px] font-medium transition-all duration-200",
            active ? "font-bold text-white" : cn(figmaClass.textSub, "hover:bg-[#f4f8ff] hover:text-[#00376e]"),
          );
          const style = active ? { backgroundColor: figma.colors.primary } : undefined;

          if (item.href) {
            return (
              <Link key={item.id} href={item.href} className={className} style={style}>
                {item.label}
                {active ? <ChevronRight className="size-4" /> : null}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => window.alert(`[Mock] ${item.label} 페이지를 준비 중입니다.`)}
              className={className}
              style={style}
            >
              {item.label}
              {active ? <ChevronRight className="size-4" /> : null}
            </button>
          );
        })}
      </nav>

      <QuickContactPanel className="mt-4" />
    </aside>
  );
}
