import { ImageUp } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type LectureFormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function LectureFormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  className,
  children,
}: LectureFormFieldProps) {
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
      {hint ? <p className="text-xs text-[#6B7280]">{hint}</p> : null}
      {error ? <p className="text-xs text-[#EF4444]">{error}</p> : null}
    </div>
  );
}

const selectClassName =
  "h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type LectureFormSelectProps = ComponentProps<"select">;

export function LectureFormSelect({ className, ...props }: LectureFormSelectProps) {
  return <select className={cn(selectClassName, className)} {...props} />;
}

export function LectureFormTextarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30",
        className,
      )}
      {...props}
    />
  );
}

type LectureThumbnailPickerProps = {
  value: string;
  onChange: (fileName: string) => void;
  className?: string;
};

/**
 * 실제 파일 업로드/저장 없이 선택한 파일명만 저장하는 임시(Mock) 썸네일 입력입니다.
 */
export function LectureThumbnailPicker({
  value,
  onChange,
  className,
}: LectureThumbnailPickerProps) {
  return (
    <label
      className={cn(
        "flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB]",
        className,
      )}
    >
      <ImageUp className="size-4 shrink-0 text-[#9CA3AF]" />
      <span className="truncate">{value || "썸네일 파일 선택 (선택, Mock)"}</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")}
      />
    </label>
  );
}
