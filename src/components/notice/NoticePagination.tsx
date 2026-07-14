"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { figma } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

const NAV_BUTTON_CLASS =
  "flex size-8 items-center justify-center rounded-md border border-[#e0e0e0] text-[#919191] transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#919191]";

export function NoticePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const pages = Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange?.(1)}
        className={NAV_BUTTON_CLASS}
        aria-label="첫 페이지"
      >
        <ChevronsLeft className="size-4" />
      </button>
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        className={NAV_BUTTON_CLASS}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((page) => {
        const active = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            className={cn(
              "flex size-8 items-center justify-center rounded-md text-[13px] font-semibold transition-all duration-200",
              active ? "text-white" : "text-[#3d3d3d] hover:bg-[#f4f8ff]",
            )}
            style={active ? { backgroundColor: figma.colors.primary } : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        className={NAV_BUTTON_CLASS}
        aria-label="다음 페이지"
      >
        <ChevronRight className="size-4" />
      </button>
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange?.(totalPages)}
        className={NAV_BUTTON_CLASS}
        aria-label="마지막 페이지"
      >
        <ChevronsRight className="size-4" />
      </button>
    </div>
  );
}
