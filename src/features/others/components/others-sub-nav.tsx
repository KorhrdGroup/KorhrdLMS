"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { OTHERS_NAV_ITEMS } from "@/features/others/constants";
import { cn } from "@/lib/utils";

export function OthersSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 pb-1" aria-label="운영관리 메뉴">
      {OTHERS_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-9 items-center rounded-lg px-4 text-[13px] font-semibold transition-colors",
              isActive
                ? "bg-[#3182f6] text-white"
                : "border border-[#e5e8eb] bg-white text-[#4e5968] hover:bg-[#f2f4f6]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
