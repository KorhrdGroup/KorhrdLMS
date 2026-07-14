"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { NOTICE_SIDEBAR_ITEMS } from "@/components/notice/data/notice-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { QuickContactPanel } from "@/components/shared/QuickContactPanel";
import { cn } from "@/lib/utils";

export function NoticeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-[230px]">
      <nav className={cn("overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {NOTICE_SIDEBAR_ITEMS.map((item) => {
          const active = item.href === pathname;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex w-full items-center justify-between px-4 py-4 text-left text-[14px] font-medium transition-all duration-200",
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
