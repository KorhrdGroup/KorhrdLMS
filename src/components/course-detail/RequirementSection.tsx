import { ArrowRight } from "lucide-react";

import type { RequirementStat } from "@/components/course-detail/types";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

function Donut({ percent }: { percent: number }) {
  return (
    <div
      className="relative flex size-16 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${figma.colors.primary} ${percent * 3.6}deg, #e9edf3 0deg)`,
      }}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-white text-[13px] font-extrabold" style={{ color: figma.colors.primary }}>
        {percent}%
      </div>
    </div>
  );
}

function BarChart({ bars }: { bars: { label: string; percent: number }[] }) {
  return (
    <div className="flex h-16 items-end gap-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-4 items-end overflow-hidden rounded-sm bg-[#e9edf3]">
            <div
              className="w-full rounded-sm"
              style={{ height: `${bar.percent}%`, backgroundColor: figma.colors.primary }}
            />
          </div>
          <span className={cn("text-[10px]", figmaClass.textPlaceholder)}>{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

function FlowVisual({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex h-16 items-center gap-2">
      <span
        className="flex h-9 items-center rounded-full px-3 text-[12px] font-bold text-white"
        style={{ backgroundColor: figma.colors.primary }}
      >
        {from}
      </span>
      <ArrowRight className="size-4" style={{ color: figma.colors.primary }} />
      <span className="flex h-9 items-center rounded-full bg-[#ffe02f] px-3 text-[12px] font-bold text-[#1d1d1d]">
        {to}
      </span>
    </div>
  );
}

function RequirementCard({ stat }: { stat: RequirementStat }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 border bg-white p-5 text-center", figmaClass.roundedCard, figmaClass.borderDefault)}>
      <span
        className="rounded px-2.5 py-1 text-[11px] font-bold text-white"
        style={{ backgroundColor: figma.colors.primary }}
      >
        {stat.category}
      </span>

      {stat.visual === "donut" ? <Donut percent={stat.percent} /> : null}
      {stat.visual === "bar" ? <BarChart bars={stat.bars} /> : null}
      {stat.visual === "flow" ? <FlowVisual from={stat.from} to={stat.to} /> : null}

      {stat.visual === "donut" ? (
        <p className={cn("text-[13px] font-semibold", figmaClass.textBody)}>{stat.label}</p>
      ) : null}
      <p className={cn("text-[12px]", figmaClass.textPlaceholder)}>{stat.caption}</p>
    </div>
  );
}

export function RequirementSection({
  requirements,
  notes,
}: {
  requirements: RequirementStat[];
  notes: string[];
}) {
  return (
    <div>
      <h2 className={cn("mb-4 text-center text-[20px] font-bold", figmaClass.textPrimary)}>자격증 발급 자격요건</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {requirements.map((stat) => (
          <RequirementCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className={cn("mt-4 rounded-lg bg-[#f7f8fa] p-4 text-[12.5px] leading-relaxed", figmaClass.textMuted)}>
        {notes.map((note) => (
          <p key={note}>· {note}</p>
        ))}
      </div>
    </div>
  );
}
