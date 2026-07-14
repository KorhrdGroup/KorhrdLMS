"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { HOME_NAV_ITEMS } from "@/components/home/data/home-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { HomeContainer } from "@/components/home/home-container";
import { SiteLogo } from "@/components/home/site-logo";
import { cn } from "@/lib/utils";

export function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={cn("sticky top-0 z-50 border-b", figmaClass.whiteBg)} style={{ borderColor: "#e4e4e4" }}>
      <HomeContainer
        className="flex items-center justify-between"
        style={{ height: figma.layout.gnbHeight }}
      >
        <SiteLogo />

        <nav className="hidden items-center lg:flex" style={{ gap: 40 }} aria-label="주요 메뉴">
          {HOME_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="shrink-0 text-[16px] leading-[19px] font-medium whitespace-nowrap text-[#333333] hover:text-[#00376e]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={cn(
            "inline-flex size-10 items-center justify-center lg:hidden",
            figmaClass.roundedButton,
            figmaClass.borderDefault,
            "border",
          )}
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </HomeContainer>

      <div className={cn("border-t lg:hidden", figmaClass.whiteBg, mobileOpen ? "block" : "hidden")}>
        <HomeContainer className="flex flex-col gap-1 py-3">
          {HOME_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-[#010101]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </HomeContainer>
      </div>
    </header>
  );
}
