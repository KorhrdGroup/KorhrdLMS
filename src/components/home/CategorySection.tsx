"use client";

import { useState } from "react";

import { COURSE_CATEGORIES } from "@/components/home/data/home-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { HomeContainer } from "@/components/home/home-container";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 11;

export function CategorySection() {
  const [page, setPage] = useState(0);

  const pages = Array.from({ length: Math.ceil(COURSE_CATEGORIES.length / PAGE_SIZE) }, (_, i) =>
    COURSE_CATEGORIES.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE),
  );

  return (
    <section
      className={figmaClass.whiteBg}
      style={{
        paddingTop: figma.spacing.categorySectionTop,
        paddingBottom: figma.spacing.categorySectionBottom,
      }}
    >
      <HomeContainer>
        <h2 className={cn(figma.typography.sectionTitle, figmaClass.textPrimary, "mb-[14px]")}>
          국가지정등록 자격취득과정
        </h2>

        <div
          className="grid grid-cols-4 sm:grid-cols-6 lg:flex lg:justify-between"
          style={{ gap: figma.layout.courseCardGap }}
        >
          {pages[page].map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                className="group flex flex-col items-center gap-2"
                style={{ width: figma.layout.categoryCardWidth }}
              >
                <span
                  className={cn(
                    "flex items-center justify-center transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_6px_14px_rgba(0,55,110,0.16)]",
                    figmaClass.pageBg,
                    figmaClass.roundedImage,
                  )}
                  style={{
                    width: figma.layout.categoryIconSize,
                    height: figma.layout.categoryIconSize,
                    backgroundColor: "#eef3fb",
                  }}
                >
                  <Icon
                    className="size-7 text-[#00376e] transition-transform duration-200 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </span>
                <span
                  className={cn(
                    "text-center transition-colors duration-200 group-hover:text-[#00376e]",
                    figma.typography.categoryLabel,
                    figmaClass.textMuted,
                  )}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        {pages.length > 1 ? (
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`카테고리 페이지 ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === page ? "w-4 bg-[#00376e]" : "w-1.5 bg-[#e4e4e4]",
                )}
                onClick={() => setPage(i)}
              />
            ))}
          </div>
        ) : null}
      </HomeContainer>
    </section>
  );
}
