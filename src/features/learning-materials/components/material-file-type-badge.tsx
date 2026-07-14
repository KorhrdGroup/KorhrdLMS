import { MATERIAL_FILE_TYPE_COLORS } from "@/features/learning-materials/constants";
import type { MaterialFileType } from "@/features/learning-materials/types/material.types";
import { cn } from "@/lib/utils";

type MaterialFileTypeBadgeProps = {
  fileType: MaterialFileType;
  className?: string;
};

export function MaterialFileTypeBadge({ fileType, className }: MaterialFileTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        MATERIAL_FILE_TYPE_COLORS[fileType],
        className,
      )}
    >
      {fileType}
    </span>
  );
}
