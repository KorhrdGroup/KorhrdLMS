import * as React from "react";

import { cn } from "@/lib/utils";

type AdminCheckboxProps = Omit<
  React.ComponentProps<"input">,
  "type" | "className"
> & {
  className?: string;
};

export const AdminCheckbox = React.forwardRef<HTMLInputElement, AdminCheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "size-4 shrink-0 rounded border-[#E5E7EB] text-[#3B82F6] accent-[#3B82F6]",
          "focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 focus-visible:outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);

AdminCheckbox.displayName = "AdminCheckbox";
