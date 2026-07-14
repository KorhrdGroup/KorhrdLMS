import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type EnrollmentFormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function EnrollmentFormField({
  label,
  htmlFor,
  required = false,
  error,
  className,
  children,
}: EnrollmentFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[#374151]"
      >
        {label}
        {required ? <span className="text-[#EF4444]"> *</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-[#EF4444]">{error}</p> : null}
    </div>
  );
}

const selectClassName =
  "h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type EnrollmentFormSelectProps = ComponentProps<"select">;

export function EnrollmentFormSelect({
  className,
  ...props
}: EnrollmentFormSelectProps) {
  return <select className={cn(selectClassName, className)} {...props} />;
}

export function EnrollmentFormTextarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30",
        className,
      )}
      {...props}
    />
  );
}
