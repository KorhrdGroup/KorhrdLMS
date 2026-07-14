"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LayoutDashboard } from "lucide-react";

import { BrandLogo } from "@/components/admin/brand-logo";
import { useAdminLayout } from "@/components/admin/layout/admin-layout-provider";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { adminNavGroups, resolveActiveAdminNav } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  className?: string;
  forceExpanded?: boolean;
  /** 모바일 드로어에서 메뉴 클릭 시 드로어를 닫기 위한 콜백입니다. */
  onNavigate?: () => void;
};

const SIDEBAR_WIDTH_EXPANDED = "w-[220px]";
const SIDEBAR_WIDTH_COLLAPSED = "w-16";

/**
 * 좌측 대메뉴 내비게이션(한평생오피스 CRM 레이아웃 참고).
 * 메뉴 구성/URL은 `@/lib/admin/navigation`의 기존 adminNavGroups를 그대로 재사용하며,
 * 새 메뉴를 추가하거나 기존 메뉴를 삭제하지 않습니다.
 */
export function AdminSidebar({
  className,
  forceExpanded = false,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAdminLayout();
  const isCollapsed = forceExpanded ? false : sidebarCollapsed;
  const activeNav = resolveActiveAdminNav(pathname);
  const isDashboardActive = pathname === "/admin";

  return (
    <aside
      className={cn(
        "no-print flex h-full shrink-0 flex-col border-r border-[#E5E7EB] bg-white transition-[width] duration-200 ease-in-out",
        isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 border-b border-[#E5E7EB]",
          isCollapsed
            ? "flex-col items-center gap-1.5 px-2 py-2.5"
            : "h-14 items-center justify-between px-3",
        )}
      >
        <Link href="/admin" className="min-w-0" onClick={onNavigate}>
          <BrandLogo collapsed={isCollapsed} size="sm" />
        </Link>

        {!forceExpanded ? (
          <AdminButton
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
            title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {isCollapsed ? (
              <ChevronsRight className="size-3.5" />
            ) : (
              <ChevronsLeft className="size-3.5" />
            )}
          </AdminButton>
        ) : null}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        <SidebarLink
          href="/admin"
          label="대시보드"
          icon={LayoutDashboard}
          active={isDashboardActive}
          collapsed={isCollapsed}
          onNavigate={onNavigate}
        />

        <div className={cn("my-1.5 border-t border-[#F3F4F6]", isCollapsed && "mx-1")} />

        {adminNavGroups.map((group) => (
          <SidebarLink
            key={group.label}
            href={group.children[0]?.href ?? "/admin"}
            label={group.label}
            icon={group.icon}
            active={activeNav?.group === group}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md text-[13px] leading-none font-medium tracking-[-0.01em] transition-all duration-150",
        collapsed ? "mx-auto size-9 justify-center" : "px-2.5 py-2.5",
        active
          ? "bg-[#EFF6FF] text-[#3B82F6]"
          : "text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111827]",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}
