"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { HERO_SLIDES } from "@/components/home/data/home-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { HomeContainer } from "@/components/home/home-container";
import { SiteLogo } from "@/components/home/site-logo";
import { logoutStudentAction } from "@/features/auth/actions/student-login.actions";
import { cn } from "@/lib/utils";

type HomeHeroMember = {
  id: string;
  loginId: string;
  name: string;
};

export function HomeHero({ member }: { member: HomeHeroMember | null }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <section className={cn(figmaClass.pageBg)} style={{ padding: `${figma.spacing.heroSection}px 0` }}>
      <HomeContainer>
        <div className="flex flex-col lg:flex-row" style={{ gap: 24 }}>
          <div
            className="relative w-full overflow-hidden border lg:shrink-0 lg:w-[791px]"
            style={{
              height: figma.layout.heroHeight,
              borderRadius: figma.radius.card,
              borderColor: "#e4e4e4",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image} alt={slide.alt} className="size-full object-cover" />

            <span className="absolute bottom-6 right-7 text-[13px] font-medium tracking-wide text-white/85 lg:right-9">
              {current + 1} / {HERO_SLIDES.length}
            </span>
          </div>

          <aside
            className={cn(
              "flex w-full flex-col items-center justify-center gap-5 border text-center lg:w-[383px] lg:shrink-0",
              figmaClass.whiteBg,
              figmaClass.roundedCard,
            )}
            style={{
              height: figma.layout.heroHeight,
              padding: figma.layout.heroLoginPadding,
              borderColor: "#e4e4e4",
            }}
          >
            <SiteLogo variant="hero" className="justify-center" />
            <p className="text-[21px] leading-[29px] font-bold text-[#1d1d1d]">
              대한민국 NO.1
              <br />
              자격전문 교육기관
            </p>

            {member ? (
              <>
                <p className="text-[16px] leading-[22px] font-medium text-[#1d1d1d]">
                  <span className="font-bold text-[#00376e]">{member.name}</span>님, 환영합니다.
                </p>

                <Link
                  href="/classroom"
                  className={cn(
                    "inline-flex h-[54px] w-full max-w-[280px] items-center justify-center text-[18px] leading-[21.6px] font-bold text-white",
                    figmaClass.roundedButton,
                  )}
                  style={{ backgroundColor: figma.colors.primary }}
                >
                  나의 강의실
                </Link>

                <form action={logoutStudentAction}>
                  <button
                    type="submit"
                    className="text-[13px] text-[#919191] hover:text-[#00376e]"
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex h-[54px] w-full max-w-[280px] items-center justify-center text-[18px] leading-[21.6px] font-bold text-white",
                    figmaClass.roundedButton,
                  )}
                  style={{ backgroundColor: figma.colors.primary }}
                >
                  로그인
                </Link>

                <div className="flex items-center gap-3 text-[13px] text-[#919191]">
                  <Link href="/signup" className="hover:text-[#00376e]">
                    회원가입
                  </Link>
                  <span className="h-3 w-px bg-[#d0d0d0]" />
                  <Link href="/find-account" className="hover:text-[#00376e]">
                    ID/PW 찾기
                  </Link>
                </div>
              </>
            )}
          </aside>
        </div>
      </HomeContainer>
    </section>
  );
}
