import * as React from "react";

import { cn } from "@/lib/utils";

export function AdminCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        className,
      )}
      {...props}
    />
  );
}

export function AdminCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-5",
        className,
      )}
      {...props}
    />
  );
}

export function AdminCardTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-lg font-bold text-[#111827]", className)}
      {...props}
    />
  );
}

export function AdminCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("mt-1 text-sm text-[#6B7280]", className)} {...props} />
  );
}

export function AdminCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}

export function AdminCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-t border-[#E5E7EB] px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}
