"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ENROLLMENT_NAV_ITEMS = [
  {
    label: "수강목록",
    href: "/admin/enrollments",
  },
  {
    label: "신청 수강생 관리",
    href: "/admin/enrollments/pending",
  },
  {
    label: "최종 수강생 관리",
    href: "/admin/enrollments/confirmed",
  },
  {
    label: "수강반 관리",
    href: "/admin/enrollments/classes",
  },
] as const;

function isNavItemActive(pathname: string, href: string) {
  if (href === "/admin/enrollments") {
    return pathname === "/admin/enrollments";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function EnrollmentSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-4"
      aria-label="수강관리 메뉴"
    >
      {ENROLLMENT_NAV_ITEMS.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);

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
