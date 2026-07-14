import { Award } from "lucide-react";

import { GovEmblem } from "@/components/home/gov-emblem";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function CertificateSection({
  samples,
  note,
}: {
  samples: { label: string; subLabel: string }[];
  note: string;
}) {
  return (
    <div>
      <h2 className={cn("mb-4 text-center text-[20px] font-bold", figmaClass.textPrimary)}>자격증 샘플</h2>

      <div className={cn("flex flex-col gap-4 border bg-[#f7f8fa] p-6 sm:flex-row", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {samples.map((sample) => (
          <div
            key={sample.label}
            className="relative flex-1 rounded-md border-4 bg-white p-5 text-center shadow-sm"
            style={{ borderColor: figma.colors.primary }}
          >
            <div
              className="absolute inset-2 rounded-sm border"
              style={{ borderColor: figma.colors.yellow }}
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-2 py-4">
              <GovEmblem className="size-8" />
              <p className={cn("text-[18px] font-extrabold tracking-[0.3em]", figmaClass.textPrimary)}>
                {sample.label}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <Award className="size-4" style={{ color: figma.colors.primary }} />
                <p className={cn("text-[12px] font-semibold", figmaClass.textMuted)}>{sample.subLabel}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className={cn("mt-3 flex items-center gap-1.5 text-[12px]", figmaClass.textPlaceholder)}>
        <span aria-hidden>ⓘ</span>
        {note}
      </p>
    </div>
  );
}
