import type { LecturePlanItem } from "@/components/course-detail/types";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function LecturePlan({ items }: { items: LecturePlanItem[] }) {
  return (
    <div>
      <h2 className={cn("mb-3 text-[18px] font-bold", figmaClass.textPrimary)}>강의계획서</h2>
      <div className={cn("grid grid-cols-1 gap-2.5 border p-4 sm:grid-cols-2", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {items.map((item) => (
          <div
            key={item.week}
            className="flex items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 transition-colors duration-200 hover:border-[#e0e0e0] hover:bg-[#f7f8fa]"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white"
              style={{ backgroundColor: figma.colors.primary }}
            >
              {item.week}강
            </span>
            <p className={cn("pt-1.5 text-[13px] leading-snug", figmaClass.textBody)}>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
