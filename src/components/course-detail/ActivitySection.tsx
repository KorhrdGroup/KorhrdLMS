"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import type { ActivityItem } from "@/components/course-detail/types";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function ActivitySection({ items }: { items: ActivityItem[] }) {
  const [activeId, setActiveId] = useState(items[1]?.id ?? items[0]?.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div>
      <h2 className={cn("mb-3 text-center text-[20px] font-bold", figmaClass.textPrimary)}>활동유형</h2>

      <div className="relative">
        <button
          type="button"
          aria-label="이전 활동유형"
          onClick={() => scrollBy(-240)}
          className="absolute top-1/2 -left-3 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-sm transition-colors duration-200 hover:bg-[#f4f8ff] sm:flex"
          style={{ borderColor: figma.colors.border }}
        >
          <ChevronLeft className="size-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "flex w-[220px] shrink-0 snap-center flex-col gap-2 rounded-lg border p-4 text-left transition-all duration-200",
                  active
                    ? "border-[#00376e] bg-[#f4f8ff] shadow-[0_6px_16px_rgba(0,55,110,0.12)]"
                    : cn("bg-white hover:bg-[#f7f8fa]", figmaClass.borderDefault),
                )}
              >
                <span
                  className={cn(
                    "inline-flex w-fit rounded px-2 py-0.5 text-[11px] font-bold",
                    active ? "text-white" : "bg-[#f0f0f0] text-[#656565]",
                  )}
                  style={active ? { backgroundColor: figma.colors.primary } : undefined}
                >
                  {item.order}
                </span>
                <p className={cn("text-[13px] leading-snug font-medium", figmaClass.textBody)}>{item.title}</p>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="다음 활동유형"
          onClick={() => scrollBy(240)}
          className="absolute top-1/2 -right-3 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-sm transition-colors duration-200 hover:bg-[#f4f8ff] sm:flex"
          style={{ borderColor: figma.colors.border }}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-label={`${item.order} 보기`}
            onClick={() => setActiveId(item.id)}
            className={cn(
              "size-1.5 rounded-full transition-all duration-200",
              item.id === activeId ? "w-4" : "",
            )}
            style={{ backgroundColor: item.id === activeId ? figma.colors.primary : figma.colors.dotInactive }}
          />
        ))}
      </div>
    </div>
  );
}
