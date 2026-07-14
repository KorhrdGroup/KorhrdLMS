import Link from "next/link";

import type { StickyEnrollData } from "@/components/course-detail/types";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

function formatPrice(value: number) {
  return value.toLocaleString("ko-KR");
}

export function StickyEnrollCard({ slug, sticky }: { slug: string; sticky: StickyEnrollData }) {
  const rows: { label: string; value: string }[] = [
    { label: "담당교수", value: sticky.professor },
    { label: "교육기간", value: sticky.period },
    { label: "강의시간", value: sticky.duration },
    { label: "수업방식", value: sticky.method },
    { label: "합격기준", value: sticky.passCriteria },
  ];

  return (
    <>
      <div className="hidden lg:block">
        <div
          className={cn(
            "sticky top-24 border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
          )}
        >
          <h3 className={cn("text-[17px] font-bold", figmaClass.textPrimary)}>{sticky.title}</h3>

          <dl className="mt-4 space-y-2.5 border-t pt-4" style={{ borderColor: "#e0e0e0" }}>
            {rows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3 text-[13px]">
                <dt className={figmaClass.textPlaceholder}>{row.label}</dt>
                <dd className={cn("text-right font-medium", figmaClass.textBody)}>{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t pt-4" style={{ borderColor: "#e0e0e0" }}>
            <span className={cn("text-[13px]", figmaClass.textPlaceholder)}>수강료</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] text-[#b0b0b0] line-through">{formatPrice(sticky.originalPrice)}원</span>
              <span className="text-[20px] font-extrabold text-[#1257ee]">
                {sticky.price === 0 ? "0원" : `${formatPrice(sticky.price)}원`}
              </span>
            </div>
          </div>

          <Link
            href={`/enrollment?select=${slug}`}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-lg text-[15px] font-bold text-white transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: "#ff9f1c" }}
          >
            {sticky.ctaLabel}
          </Link>
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden"
        style={{ borderColor: figma.colors.border }}
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-[12px] text-[#b0b0b0] line-through">{formatPrice(sticky.originalPrice)}원</span>
          <span className="text-[18px] font-extrabold text-[#1257ee]">
            {sticky.price === 0 ? "0원" : `${formatPrice(sticky.price)}원`}
          </span>
        </div>
        <Link
          href={`/enrollment?select=${slug}`}
          className="flex h-11 max-w-[220px] flex-1 items-center justify-center rounded-lg text-[14px] font-bold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: "#ff9f1c" }}
        >
          {sticky.ctaLabel}
        </Link>
      </div>
    </>
  );
}
