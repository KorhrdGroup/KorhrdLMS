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
    <div className="no-print shrink-0 border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
      <nav className="flex gap-1 overflow-x-auto py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {activeNav.group.children.map((child) => {
          const isActive = child === activeNav.child;

          return (
            <Link
              key={`${activeNav.group.label}-${child.label}`}
              href={child.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] whitespace-nowrap transition-all duration-150",
                isActive
                  ? "bg-[#EFF6FF] text-[#3B82F6]"
                  : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]",
              )}
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
