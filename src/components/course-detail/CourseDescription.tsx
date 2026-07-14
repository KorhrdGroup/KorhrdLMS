import type { CourseDescriptionData } from "@/components/course-detail/types";
import { GovEmblem } from "@/components/home/gov-emblem";
import { figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function CourseDescription({ description }: { description: CourseDescriptionData }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <div className="flex-1">
        <h2 className={cn("text-[20px] font-bold", figmaClass.textPrimary)}>{description.heading}</h2>
        <p className={cn("mt-3 text-[14px] leading-relaxed whitespace-pre-line", figmaClass.textBody)}>
          {description.body}
        </p>
      </div>
      {description.image ? (
        <div className="relative h-[160px] w-full shrink-0 overflow-hidden rounded-lg sm:w-[220px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={description.image} alt="" className="size-full object-cover" />
          {description.ministry ? (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/95 py-0.5 pr-2 pl-1 shadow-sm">
              <GovEmblem className="size-4" />
              <span className="text-[10px] font-semibold text-[#1d1d1d]">{description.ministry}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
