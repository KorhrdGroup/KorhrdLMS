"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const EXAM_NAV_ITEMS = [
  {
    label: "시험관리",
    href: "/admin/exams",
  },
  {
    label: "시험문제 관리(인쇄용)",
    href: "/admin/exams/questions",
  },
] as const;

const OTHER_ITEM_HREFS = EXAM_NAV_ITEMS.filter((item) => item.href !== "/admin/exams").map(
  (item) => item.href,
);

function isItemActive(pathname: string, href: string) {
  if (href === "/admin/exams") {
    const matchesOtherItem = OTHER_ITEM_HREFS.some(
      (otherHref) => pathname === otherHref || pathname.startsWith(`${otherHref}/`),
    );
    return !matchesOtherItem;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ExamSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-4"
      aria-label="시험관리 메뉴"
    >
      {EXAM_NAV_ITEMS.map((item) => {
        const isActive = isItemActive(pathname, item.href);

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
