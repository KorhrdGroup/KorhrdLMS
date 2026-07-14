import { cn } from "@/lib/utils";

type SignupFormFieldProps = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  helpText?: string;
  className?: string;
};

export function SignupFormField({
  label,
  htmlFor,
  children,
  helpText,
  className,
}: SignupFormFieldProps) {
  return (
    <div className={cn("space-y-0", className)}>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-[#222] sm:text-[15px]">
        {label}
      </label>
      {children}
      {helpText ? <p className="mt-1.5 text-xs leading-relaxed text-[#e74c3c]">{helpText}</p> : null}
    </div>
  );
}

export const signupInputClassName =
  "h-11 w-full rounded border border-[#ddd] bg-white px-3 text-sm text-[#222] outline-none placeholder:text-[#999] focus:border-[#00376e] sm:h-12 sm:text-base";

export const signupSelectClassName =
  "h-11 w-full rounded border border-[#ddd] bg-white px-3 text-sm text-[#666] outline-none focus:border-[#00376e] sm:h-12 sm:text-base";
