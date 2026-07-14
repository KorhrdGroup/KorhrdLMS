"use client";

import { useState, useTransition } from "react";

import { setCourseCategoryActiveAction } from "@/features/course-categories/actions/course-category.actions";
import { cn } from "@/lib/utils";

type CourseCategoryActiveToggleProps = {
  categoryId: string;
  isActive: boolean;
  onChanged: (isActive: boolean) => void;
};

export function CourseCategoryActiveToggle({
  categoryId,
  isActive,
  onChanged,
}: CourseCategoryActiveToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleClick() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await setCourseCategoryActiveAction(categoryId, !isActive);
      if (result.success) {
        onChanged(result.isActive);
      } else {
        setErrorMessage(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          isActive
            ? "bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"
            : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
        )}
      >
        {isActive ? "사용중" : "미사용"}
      </button>
      {errorMessage ? <p className="text-xs text-[#EF4444]">{errorMessage}</p> : null}
    </div>
  );
}
