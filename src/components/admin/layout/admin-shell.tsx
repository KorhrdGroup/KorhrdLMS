"use client";

import { AdminContent } from "@/components/admin/layout/admin-content";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { useAdminLayout } from "@/components/admin/layout/admin-layout-provider";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminSubNav } from "@/components/admin/layout/admin-subnav";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useAdminLayout();

  return (
    <div className="flex h-svh overflow-hidden bg-[#F5F5F5]">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="사이드바 닫기"
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-[220px] shadow-xl">
            <AdminSidebar forceExpanded onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminHeader />
        <AdminSubNav />
        <AdminContent>{children}</AdminContent>
      </div>
    </div>
  );
}

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
