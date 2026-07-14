"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { adminButtonVariants } from "@/components/admin/ui/admin-button";
import {
  buildListQueryString,
  type ListQuery,
} from "@/lib/shared/list-query";
import { cn } from "@/lib/utils";

type AdminListPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  query: ListQuery;
  buildPageHref?: (page: number, query: ListQuery) => string;
  className?: string;
};

export function AdminListPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  query,
  buildPageHref,
  className,
}: AdminListPaginationProps) {
  const pathname = usePathname();
  const startItem = totalItems ? (page - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(page * pageSize, totalItems) : 0;
  const pages = getVisiblePages(page, totalPages);
  const linkClass = adminButtonVariants({ variant: "outline", size: "icon" });
  const activeClass = adminButtonVariants({ variant: "primary", size: "icon" });

  function hrefForPage(targetPage: number) {
    if (buildPageHref) {
      return buildPageHref(targetPage, query);
    }

    return `${pathname}${buildListQueryString({ page: targetPage }, query)}`;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-[#6B7280]">
        {totalItems}건 중 {startItem}-{endItem}
      </p>

      <div className="flex items-center gap-1">
        {page <= 1 ? (
          <span className={cn(linkClass, "size-9 opacity-50")} aria-hidden>
            <ChevronLeft className="size-4" />
          </span>
        ) : (
          <Link
            href={hrefForPage(page - 1)}
            className={cn(linkClass, "size-9")}
            aria-label="이전 페이지"
          >
            <ChevronLeft className="size-4" />
          </Link>
        )}

        {pages.map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-[#9CA3AF]"
            >
              ...
            </span>
          ) : pageNumber === page ? (
            <span
              key={pageNumber}
              className={cn(activeClass, "size-9 pointer-events-none")}
              aria-current="page"
            >
              {pageNumber}
            </span>
          ) : (
            <Link
              key={pageNumber}
              href={hrefForPage(pageNumber)}
              className={cn(linkClass, "size-9")}
              aria-label={`${pageNumber}페이지`}
            >
              {pageNumber}
            </Link>
          ),
        )}

        {page >= totalPages ? (
          <span className={cn(linkClass, "size-9 opacity-50")} aria-hidden>
            <ChevronRight className="size-4" />
          </span>
        ) : (
          <Link
            href={hrefForPage(page + 1)}
            className={cn(linkClass, "size-9")}
            aria-label="다음 페이지"
          >
            <ChevronRight className="size-4" />
          </Link>
        )}
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
