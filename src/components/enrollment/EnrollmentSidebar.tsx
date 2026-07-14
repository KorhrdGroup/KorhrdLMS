"use client";

import { ChevronRight } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import { QuickContactPanel } from "@/components/shared/QuickContactPanel";
import type { EnrollmentCatalogCategory } from "@/features/enrollment-catalog/types/enrollment-catalog.types";
import { cn } from "@/lib/utils";

export function EnrollmentSidebar({
  categories,
  activeCategory,
  onSelectCategory,
}: {
  categories: EnrollmentCatalogCategory[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}) {
  return (
    <aside className="w-full shrink-0 lg:w-[230px]">
      <nav className={cn("overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {categories.map((category) => {
          const active = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex w-full items-center justify-between px-4 py-3.5 text-left text-[14px] font-medium transition-all duration-200",
                active
                  ? "font-bold text-white"
                  : cn(figmaClass.textSub, "hover:bg-[#f4f8ff] hover:text-[#00376e]"),
              )}
              style={active ? { backgroundColor: figma.colors.primary } : undefined}
            >
              {category.label}
              {active ? <ChevronRight className="size-4" /> : null}
            </button>
          );
        })}
      </nav>

      <QuickContactPanel className="mt-4" />
    </aside>
  );
}
