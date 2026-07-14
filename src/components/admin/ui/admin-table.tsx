import * as React from "react";

import { cn } from "@/lib/utils";

export function AdminTable({
  className,
  ...props
}: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function AdminTableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function AdminTableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

export function AdminTableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB]",
        className,
      )}
      {...props}
    />
  );
}

export function AdminTableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-11 bg-[#F9FAFB] px-4 text-left text-[13px] font-semibold text-[#6B7280]",
        className,
      )}
      {...props}
    />
  );
}

export function AdminTableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td
      className={cn("px-4 py-3 align-middle text-[14px] text-[#111827]", className)}
      {...props}
    />
  );
}
