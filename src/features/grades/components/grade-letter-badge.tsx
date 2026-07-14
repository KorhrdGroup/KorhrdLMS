import { GRADE_LETTER_STYLES } from "@/features/grades/constants";
import type { GradeLetter } from "@/features/grades/lib/grade-calculator";
import { cn } from "@/lib/utils";

type GradeLetterBadgeProps = {
  grade: GradeLetter;
  className?: string;
};

export function GradeLetterBadge({ grade, className }: GradeLetterBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-xs font-semibold",
        GRADE_LETTER_STYLES[grade],
        className,
      )}
    >
      {grade}
    </span>
  );
}
