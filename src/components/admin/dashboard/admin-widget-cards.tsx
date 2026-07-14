import Link from "next/link";

import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/admin-card";
import { AdminButton, adminButtonVariants } from "@/components/admin/ui/admin-button";
import type { AdminWidgetItem } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

type AdminBoardWidgetCardProps = {
  title: string;
  items: AdminWidgetItem[];
  href?: string;
  actionLabel?: string;
};

export function AdminBoardWidgetCard({
  title,
  items,
  href,
  actionLabel = "더보기",
}: AdminBoardWidgetCardProps) {
  return (
    <AdminCard className="flex h-full flex-col">
      <AdminCardHeader className="items-center border-b border-[#E5E7EB] py-3">
        <AdminCardTitle className="text-base">{title}</AdminCardTitle>
        {href ? (
          <Link
            href={href}
            className={adminButtonVariants({ variant: "ghost", size: "sm" })}
          >
            {actionLabel}
          </Link>
        ) : (
          <AdminButton variant="ghost" size="sm" disabled>
            {actionLabel}
          </AdminButton>
        )}
      </AdminCardHeader>
      <AdminCardContent className="flex-1 px-0 py-0">
        <ul className="divide-y divide-[#E5E7EB]">
          {items.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <span className="line-clamp-2 text-sm text-[#111827]">
                {item.title}
              </span>
              {item.date ? (
                <span className="shrink-0 text-xs text-[#9CA3AF]">
                  {item.date}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </AdminCardContent>
    </AdminCard>
  );
}

/**
 * 이전 좌측 사이드바에 있던 "이번 달 캘린더" 위젯입니다.
 * 사이드바가 메뉴 전용 내비게이션으로 개편되면서 관리자 홈 대시보드로 이동했습니다
 * (기능/데이터는 동일하게 유지, 배치 위치만 변경).
 */
export function AdminMiniCalendarCard() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const calendarCells = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1,
  );

  return (
    <AdminCard>
      <AdminCardHeader className="border-0 px-4 py-3">
        <AdminCardTitle className="text-base">
          {year}년 {month + 1}월
        </AdminCardTitle>
      </AdminCardHeader>
      <AdminCardContent className="px-4 pb-4">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] text-[#9CA3AF]">
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {calendarCells.map((day, index) => (
            <span
              key={`${day ?? "empty"}-${index}`}
              className={cn(
                "flex h-7 items-center justify-center rounded-md",
                day === today.getDate() && "bg-[#3B82F6] font-medium text-white",
                day !== today.getDate() && day && "text-[#6B7280]",
              )}
            >
              {day ?? ""}
            </span>
          ))}
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}

type AdminStatWidgetCardProps = {
  title: string;
  lines: Array<{ label: string; value: string }>;
  href?: string;
};

export function AdminStatWidgetCard({
  title,
  lines,
  href,
}: AdminStatWidgetCardProps) {
  return (
    <AdminCard className="p-4">
      {href ? (
        <Link
          href={href}
          className="text-sm font-bold text-[#111827] hover:text-[#3B82F6] hover:underline"
        >
          {title}
        </Link>
      ) : (
        <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
      )}
      <dl className="mt-3 space-y-2">
        {lines.map((line) => (
          <div
            key={line.label}
            className="flex items-center justify-between text-sm"
          >
            <dt className="text-[#6B7280]">{line.label}</dt>
            <dd className="font-medium text-[#111827]">{line.value}</dd>
          </div>
        ))}
      </dl>
    </AdminCard>
  );
}
