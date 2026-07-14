"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { QUICK_MENU_ITEMS } from "@/components/home/data/home-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function QuickMenu() {
  return (
    <aside
      className="fixed top-[280px] right-4 z-40 hidden w-[68px] flex-col overflow-hidden border xl:flex"
      style={{
        borderRadius: figma.radius.image,
        borderColor: "#e4e4e4",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="flex flex-col items-center gap-1 py-3 text-white"
        style={{ backgroundColor: figma.colors.primary }}
      >
        <Star className="size-4 fill-current text-[#ffe02f]" />
        <span className="text-[11px] font-bold leading-none">간편메뉴</span>
      </div>

      {QUICK_MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group flex flex-col items-center gap-1.5 border-t bg-white px-1 py-3.5 transition-all duration-200 hover:bg-[#00376e]",
              figmaClass.borderDefault,
            )}
          >
            <Icon
              className="size-5 text-[#00376e] transition-all duration-200 group-hover:scale-110 group-hover:text-white"
              strokeWidth={1.75}
            />
            <span className="text-center text-[10.5px] leading-tight font-medium text-[#3d3d3d] transition-colors duration-200 group-hover:text-white">
              {item.label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
