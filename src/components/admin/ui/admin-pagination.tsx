"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn } from "@/lib/utils";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
};

export function AdminPagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  className,
}: AdminPaginationProps) {
  const startItem = totalItems ? (page - 1) * pageSize + 1 : undefined;
  const endItem = totalItems
    ? Math.min(page * pageSize, totalItems)
    : undefined;

  const pages = getVisiblePages(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {totalItems ? (
        <p className="text-sm text-[#6B7280]">
          {totalItems}건 중 {startItem}-{endItem}
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <AdminButton
          variant="outline"
          size="icon"
          className="size-9"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="size-4" />
        </AdminButton>

        {pages.map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-[#9CA3AF]"
            >
              ...
            </span>
          ) : (
            <AdminButton
              key={pageNumber}
              variant={pageNumber === page ? "primary" : "outline"}
              size="icon"
              className={cn(
                "size-9",
                pageNumber === page && "pointer-events-none",
              )}
              onClick={() => onPageChange(pageNumber)}
              aria-label={`${pageNumber}페이지`}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </AdminButton>
          ),
        )}

        <AdminButton
          variant="outline"
          size="icon"
          className="size-9"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="다음 페이지"
        >
          <ChevronRight className="size-4" />
        </AdminButton>
      </div>
    </div>
  );
}

function getVisiblePages(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "ellipsis", total];
  }

  if (current >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total];
  }

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}
