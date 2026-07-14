"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";

import { useAdminLayout } from "@/components/admin/layout/admin-layout-provider";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { resolveActiveAdminNav } from "@/lib/admin/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * 상단 바(대메뉴는 좌측 사이드바로 이동했습니다).
 * 현재 선택된 대메뉴 이름과, 관리자 프로필/로그아웃 등 계정 관련 기능만 표시합니다.
 */
export function AdminHeader() {
  const pathname = usePathname();
  const { adminUser, logout, setMobileSidebarOpen } = useAdminLayout();
  const activeNav = resolveActiveAdminNav(pathname);

  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-3 border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
      <AdminButton
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="사이드바 열기"
      >
        <Menu className="size-5" />
      </AdminButton>

      <h1 className="min-w-0 truncate text-[15px] font-bold tracking-[-0.01em] text-[#111827]">
        {activeNav?.group.label ?? "대시보드"}
      </h1>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden max-w-[100px] truncate text-[13px] font-medium text-[#111827] sm:inline md:max-w-none">
          {adminUser.name}
        </span>

        <AdminButton
          variant="ghost"
          size="sm"
          className="hidden text-[#6B7280] hover:text-[#111827] md:inline-flex"
          onClick={logout}
        >
          로그아웃
        </AdminButton>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-[13px] font-medium text-[#111827] transition-colors",
              "hover:bg-[#F0F0F0] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 focus-visible:outline-none",
            )}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#3B82F6]">
              {adminUser.name.slice(0, 1)}
            </span>
            <span className="hidden sm:inline">프로필</span>
            <ChevronDown className="size-3.5 text-[#9CA3AF]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="min-w-48 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
          >
            <DropdownMenuLabel className="px-3 py-2 text-[#111827]">
              <p className="text-sm font-medium">{adminUser.name}</p>
              <p className="text-xs font-normal text-[#9CA3AF]">
                {adminUser.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#E5E7EB]" />
            <DropdownMenuItem
              disabled
              className="gap-2 rounded-md px-3 py-2 text-sm text-[#6B7280]"
            >
              <User className="size-4" />
              내 프로필
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled
              className="gap-2 rounded-md px-3 py-2 text-sm text-[#6B7280]"
            >
              <Settings className="size-4" />
              계정 설정
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#E5E7EB]" />
            <DropdownMenuItem
              className="gap-2 rounded-md px-3 py-2 text-sm text-[#EF4444] focus:bg-[#FEF2F2] focus:text-[#EF4444]"
              onClick={logout}
            >
              <LogOut className="size-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
