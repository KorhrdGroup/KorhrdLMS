import * as React from "react";

import { cn } from "@/lib/utils";

type AdminInputProps = React.ComponentProps<"input"> & {
  variant?: "filled" | "outline";
};

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ className, variant = "filled", type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-10 w-full rounded-lg px-4 text-[15px] text-[#111827] outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          variant === "filled"
            ? "border-0 bg-[#F0F0F0] placeholder:text-[#9CA3AF] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
            : "border border-[#E5E7EB] bg-white placeholder:text-[#9CA3AF] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30",
          className,
        )}
        {...props}
      />
    );
  },
);

AdminInput.displayName = "AdminInput";

type AdminInputGroupProps = React.ComponentProps<"div">;

export function AdminInputGroup({ className, ...props }: AdminInputGroupProps) {
  return <div className={cn("relative", className)} {...props} />;
}

type AdminInputIconProps = React.ComponentProps<"div">;

export function AdminInputIcon({ className, ...props }: AdminInputIconProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9CA3AF]",
        className,
      )}
      {...props}
    />
  );
}
