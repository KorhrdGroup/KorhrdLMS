"use client";

import { cn } from "@/lib/utils";

export type AdminTabItem = {
  id: string;
  label: string;
};

type AdminTabsProps = {
  tabs: AdminTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
};

export function AdminTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: AdminTabsProps) {
  return (
    <div className={className}>
      <div className="border-b border-[#E5E7EB]">
        <nav
          className="-mb-px flex flex-wrap gap-1 overflow-x-auto"
          aria-label="탭"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#3B82F6] text-[#3B82F6]"
                    : "border-transparent text-[#6B7280] hover:border-[#E5E7EB] hover:text-[#111827]",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div role="tabpanel" className="py-6">
        {children}
      </div>
    </div>
  );
}
