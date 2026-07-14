import { cn } from "@/lib/utils";

type MemberDeletedBadgeProps = {
  className?: string;
};

export function MemberDeletedBadge({ className }: MemberDeletedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#6B7280]",
        className,
      )}
    >
      삭제
    </span>
  );
}
