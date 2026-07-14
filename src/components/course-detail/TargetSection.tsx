"use client";

import { useState } from "react";

import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function TargetSection({ targets }: { targets: string[] }) {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <div>
      <h2 className={cn("mb-4 text-center text-[20px] font-bold", figmaClass.textPrimary)}>
        이런 분들에게 <span style={{ color: figma.colors.primary }}>유용해요!</span>
      </h2>

      <div className="flex flex-col gap-2">
        {targets.map((target, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={target}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200",
                active
                  ? "border-[#00376e] bg-[#f4f8ff]"
                  : cn("bg-white hover:bg-[#f7f8fa]", figmaClass.borderDefault),
              )}
            >
              <span
                className={cn("text-[13px] font-extrabold", active ? "" : figmaClass.textPlaceholder)}
                style={active ? { color: figma.colors.primary } : undefined}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={cn("text-[14px]", active ? "font-semibold" : figmaClass.textBody)}>
                {target}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
