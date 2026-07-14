import type { ProfessorData } from "@/components/course-detail/types";
import { figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function ProfessorSection({ professor }: { professor: ProfessorData }) {
  return (
    <div className={cn("border p-5", figmaClass.roundedCard, figmaClass.borderDefault)}>
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={professor.photo} alt={professor.name} className="size-full object-cover" />
        </div>
        <div>
          <p className={cn("text-[12px] font-semibold", figmaClass.textPlaceholder)}>{professor.courseLabel}</p>
          <p className={cn("text-[18px] font-bold", figmaClass.textPrimary)}>{professor.name}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2" style={{ borderColor: "#e0e0e0" }}>
        <div>
          <p className={cn("mb-2 text-[13px] font-bold", figmaClass.textSub)}>[ 소속 ]</p>
          <ul className={cn("space-y-1 text-[13px]", figmaClass.textBody)}>
            {professor.intro.map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className={cn("mb-2 text-[13px] font-bold", figmaClass.textSub)}>[ 학력 및 이력 ]</p>
          <ul className={cn("space-y-1 text-[13px]", figmaClass.textBody)}>
            {professor.education.map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
