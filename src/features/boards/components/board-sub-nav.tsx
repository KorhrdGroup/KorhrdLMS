"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BOARD_NAV_ITEMS } from "@/features/boards/constants";
import { cn } from "@/lib/utils";

export function BoardSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-4"
      aria-label="게시판관리 메뉴"
    >
      {BOARD_NAV_ITEMS.map((item) => {
        const href = `/admin/boards/${item.boardType}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={item.boardType}
            href={href}
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
