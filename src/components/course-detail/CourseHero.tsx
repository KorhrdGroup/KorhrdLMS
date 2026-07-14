import { Award, Sparkles } from "lucide-react";
import Link from "next/link";

import type { CourseBadge } from "@/components/course-detail/types";
import { GovEmblem } from "@/components/home/gov-emblem";
import { HomeContainer } from "@/components/home/home-container";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

const BADGE_ICON: Record<CourseBadge["tone"], typeof Award> = {
  recommend: Sparkles,
  new: Award,
  urgent: Award,
};

const BADGE_CLASS: Record<CourseBadge["tone"], string> = {
  recommend: "bg-white/15 text-white",
  new: "bg-[#ffe02f] text-[#1d1d1d]",
  urgent: "bg-[#e5433f] text-white",
};

function formatPrice(value: number) {
  return value.toLocaleString("ko-KR");
}

export function CourseHero({
  slug,
  title,
  ministry,
  badges,
  originalPrice,
  price,
  ctaLabel,
}: {
  slug: string;
  title: string;
  ministry: string;
  badges: CourseBadge[];
  originalPrice: number;
  price: number;
  ctaLabel: string;
}) {
  return (
    <section className="relative">
      <div
        className="relative flex h-[360px] items-center overflow-hidden sm:h-[420px]"
        style={{
          background:
            "radial-gradient(120% 140% at 85% 10%, #145374 0%, #0b3d5c 45%, #04263f 100%)",
        }}
      >
        <div
          className="absolute -top-24 -right-16 size-[420px] rounded-full bg-white/5 blur-3xl"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.06),transparent_60%)]" aria-hidden />

        <HomeContainer className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((badge) => {
              const Icon = BADGE_ICON[badge.tone];
              return (
                <span
                  key={badge.label}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-bold",
                    BADGE_CLASS[badge.tone],
                  )}
                >
                  <Icon className="size-3.5" />
                  {badge.label}
                </span>
              );
            })}
          </div>

          <h1 className="mt-4 max-w-2xl text-[32px] leading-[1.3] font-extrabold text-white sm:text-[40px]">
            {title}
          </h1>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white backdrop-blur-sm">
            <GovEmblem className="size-5" />
            <span className="text-[14px] font-semibold">{ministry}</span>
          </div>
        </HomeContainer>
      </div>

      <HomeContainer>
        <div
          className={cn(
            "relative z-10 -mt-10 flex flex-col gap-4 border bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center sm:justify-between",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
          )}
        >
          <div className="flex flex-wrap items-center gap-2 text-[14px]">
            <span
              className="rounded px-2 py-1 text-[12px] font-bold text-white"
              style={{ backgroundColor: figma.colors.primary }}
            >
              추천과정
            </span>
            <span className={cn("font-bold", figmaClass.textPrimary)}>{title}</span>
            <span className="font-bold text-[#1257ee]">무료수강</span>
          </div>

          <div className="flex items-center justify-between gap-6 sm:justify-end">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-[13px]", figmaClass.textPlaceholder)}>수강료</span>
              <span className="text-[14px] text-[#b0b0b0] line-through">{formatPrice(originalPrice)}원</span>
              <span className="text-[22px] font-extrabold text-[#1257ee]">
                {price === 0 ? "0원" : `${formatPrice(price)}원`}
              </span>
            </div>
            <Link
              href={`/enrollment?select=${slug}`}
              className="flex h-12 shrink-0 items-center justify-center rounded-lg px-7 text-[15px] font-bold whitespace-nowrap text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: "#ff9f1c" }}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </HomeContainer>
    </section>
  );
}
