"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import { QuickContactPanel } from "@/components/shared/QuickContactPanel";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  href: string;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "자격증발급신청", href: "/certificate/apply" },
  { label: "자격증발급신청 조회", href: "/certificate/history" },
  { label: "자격증발급안내", href: "#" },
  { label: "자격증카드결제신청", href: "#" },
];

/** 자격증발급신청/조회 화면 좌측 메뉴. 수강신청 사이드바(`EnrollmentSidebar`)와 동일한 톤을 사용합니다. */
export function CertificateSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-[230px]">
      <nav className={cn("overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {SIDEBAR_ITEMS.map((item) => {
          const active = item.href !== "#" && pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex w-full items-center justify-between px-4 py-3.5 text-left text-[14px] font-medium transition-all duration-200",
                active
                  ? "font-bold text-white"
                  : cn(figmaClass.textSub, "hover:bg-[#f4f8ff] hover:text-[#00376e]"),
              )}
              style={active ? { backgroundColor: figma.colors.primary } : undefined}
            >
              {item.label}
              {active ? <ChevronRight className="size-4" /> : null}
            </Link>
          );
        })}
      </nav>

      <QuickContactPanel className="mt-4" />
    </aside>
  );
}
