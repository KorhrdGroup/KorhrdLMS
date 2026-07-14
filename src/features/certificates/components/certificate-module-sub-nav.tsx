"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const CERTIFICATE_NAV_ITEMS = [
  {
    label: "수료증관리",
    href: "/admin/certificates",
  },
  {
    label: "자격증신청관리",
    href: "/admin/certificates/applications",
  },
] as const;

const OTHER_ITEM_HREFS = CERTIFICATE_NAV_ITEMS.filter(
  (item) => item.href !== "/admin/certificates",
).map((item) => item.href);

function isItemActive(pathname: string, href: string) {
  if (href === "/admin/certificates") {
    const matchesOtherItem = OTHER_ITEM_HREFS.some(
      (otherHref) => pathname === otherHref || pathname.startsWith(`${otherHref}/`),
    );
    return !matchesOtherItem;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CertificateModuleSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-4"
      aria-label="수료증/자격증 관리 메뉴"
    >
      {CERTIFICATE_NAV_ITEMS.map((item) => {
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
