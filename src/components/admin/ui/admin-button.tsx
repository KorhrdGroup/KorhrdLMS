import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const adminButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-[15px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:bg-[#CCCCCC] disabled:text-white",
        outline:
          "border border-[#E5E7EB] bg-white text-[#3B82F6] hover:bg-[#EFF6FF]",
        secondary:
          "border border-[#E5E7EB] bg-[#F0F0F0] text-[#111827] hover:bg-[#E5E7EB]",
        ghost:
          "bg-transparent text-[#6B7280] hover:bg-[#F0F0F0] hover:text-[#111827]",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] disabled:bg-[#CCCCCC]",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-5",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type AdminButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof adminButtonVariants>;

export function AdminButton({
  className,
  variant,
  size,
  type = "button",
  ...props
}: AdminButtonProps) {
  return (
    <button
      type={type}
      className={cn(adminButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { adminButtonVariants };
