"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { STATISTICS_NAV_ITEMS } from "@/features/statistics/constants";
import { cn } from "@/lib/utils";

export function StatisticsSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-4"
      aria-label="통계 메뉴"
    >
      {STATISTICS_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#3B82F6] text-white"
                : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
