import Link from "next/link";

import {
  AdminBoardWidgetCard,
  AdminMiniCalendarCard,
  AdminStatWidgetCard,
} from "@/components/admin/dashboard/admin-widget-cards";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/admin-card";
import { adminButtonVariants } from "@/components/admin/ui/admin-button";
import {
  adminBoardWidgets,
  adminExamWidget,
  adminStatWidgets,
} from "@/lib/admin/navigation";

export function AdminHomePage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {adminBoardWidgets.map((widget) => (
            <AdminBoardWidgetCard
              key={widget.id}
              title={widget.title}
              items={widget.items}
              href={widget.href}
            />
          ))}
        </div>

        <div className="space-y-4">
          {adminStatWidgets.map((widget) => (
            <AdminStatWidgetCard
              key={widget.id}
              title={widget.title}
              lines={widget.lines}
              href={widget.href}
            />
          ))}
          <AdminMiniCalendarCard />
        </div>
      </div>

      <AdminCard>
        <AdminCardHeader className="items-center border-b border-[#E5E7EB]">
          <AdminCardTitle className="text-base">
            {adminExamWidget.title}
          </AdminCardTitle>
          <Link
            href="/admin/exams"
            className={adminButtonVariants({ variant: "ghost", size: "sm" })}
          >
            더보기
          </Link>
        </AdminCardHeader>
        <AdminCardContent className="grid gap-6 md:grid-cols-2">
          {adminExamWidget.sections.map((section) => (
            <div key={section.label}>
              <Link
                href={section.href}
                className="mb-3 block text-sm font-semibold text-[#111827] hover:text-[#3B82F6] hover:underline"
              >
                {section.label}
              </Link>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"
                  >
                    <p className="text-sm font-medium text-[#111827]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">{item.period}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
