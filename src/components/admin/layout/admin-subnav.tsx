"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { resolveActiveAdminNav } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

/**
 * 상단 소메뉴 탭. 좌측 사이드바에서 선택된 대메뉴의 하위 메뉴(children)만 표시합니다.
 * 대메뉴에 속하지 않는 화면(예: 관리자 홈)에서는 표시하지 않습니다.
 */
export function AdminSubNav() {
  const pathname = usePathname();
  const activeNav = resolveActiveAdminNav(pathname);

  if (!activeNav) {
    return null;
  }

  return (
    <div className="no-print shrink-0 border-b border-[#E5E7EB] bg-white px-4 sm:px-6 lg:px-8">
      <nav className="flex gap-1.5 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {activeNav.group.children.map((child) => {
          const isActive = child === activeNav.child;

          return (
            <Link
              key={`${activeNav.group.label}-${child.label}`}
              href={child.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium tracking-[-0.01em] whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 focus-visible:outline-none",
                isActive
                  ? "bg-[#EAF2FF] font-semibold text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#111827]",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {child.label}
              {child.implemented === false ? (
                <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#9CA3AF]">
                  준비중
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
