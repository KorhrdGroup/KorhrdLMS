"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  FAMILY_SITES,
  FOOTER_COMPANY,
  FOOTER_LINKS,
  PARTNER_LOGOS,
} from "@/components/home/data/home-data";
import { GovEmblem } from "@/components/home/gov-emblem";
import { figma, figmaClass, homeColors } from "@/components/home/home-design";
import { HomeContainer } from "@/components/home/home-container";
import { cn } from "@/lib/utils";

export function HomeFooter() {
  return (
    <footer>
      <div className={cn("border-t py-4", figmaClass.whiteBg, figmaClass.borderDefault)}>
        <HomeContainer>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
            {PARTNER_LOGOS.map((logo) => (
              <span
                key={logo.id}
                className={cn("flex items-center gap-2 text-[13px] font-medium", figmaClass.textSub)}
              >
                <GovEmblem className="size-4" />
                {logo.label}
              </span>
            ))}
          </div>
        </HomeContainer>
      </div>

      <div style={{ backgroundColor: homeColors.footerDark, minHeight: figma.layout.footerHeight }}>
        <HomeContainer className="py-8">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-white/90">
            {FOOTER_LINKS.map((link, index) => (
              <li key={link.label} className="flex items-center gap-4">
                <Link href={link.href} className="hover:opacity-80">
                  {link.label}
                </Link>
                {index < FOOTER_LINKS.length - 1 ? (
                  <span className="hidden text-white/25 sm:inline">|</span>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px] lg:items-start">
            <address className="space-y-1.5 not-italic text-[13px] leading-relaxed text-white/50">
              <p>
                {FOOTER_COMPANY.name} | 대표 : {FOOTER_COMPANY.representative} | 사업자등록번호 :{" "}
                {FOOTER_COMPANY.businessNumber}
              </p>
              <p>주소 : {FOOTER_COMPANY.address}</p>
              <p>
                Tel : {FOOTER_COMPANY.phone} | E-mail : {FOOTER_COMPANY.email}
              </p>
              <p>통신판매업신고 : {FOOTER_COMPANY.mailOrderReport}</p>
              <p className="pt-4 text-[12px] text-white/35">
                Copyright © 2024 All rights reserved.
              </p>
            </address>

            <div className="flex flex-col gap-3">
              <Link
                href="https://pqi.or.kr/indexMain.do"
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex items-center justify-between rounded-lg bg-white px-4 py-3 transition hover:bg-[#fafafa]",
                  figmaClass.textBody,
                )}
              >
                <div>
                  <p className="text-[13px] font-bold">한국직업능력개발원</p>
                  <p className={cn("text-[11px]", figmaClass.textMuted)}>
                    민간자격관리운영센터에서 등록조회
                  </p>
                </div>
                <ChevronRight className={cn("size-4", figmaClass.textPlaceholder)} />
              </Link>

              <label className="relative block">
                <span className="sr-only">패밀리 사이트</span>
                <select
                  className="h-10 w-full appearance-none rounded-lg border border-[#444] bg-[#333] px-4 text-[13px] text-white/80 outline-none"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) window.open(e.target.value, "_blank");
                  }}
                >
                  <option value="">패밀리 사이트 바로가기</option>
                  {FAMILY_SITES.map((site) => (
                    <option key={site.label} value={site.href} className={figmaClass.textBody}>
                      {site.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-white/50" />
              </label>
            </div>
          </div>
        </HomeContainer>
      </div>
    </footer>
  );
}
