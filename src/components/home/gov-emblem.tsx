import { cn } from "@/lib/utils";

/** Generic government-agency emblem placeholder (실제 부처 로고 이미지가 없을 때 사용) */
export function GovEmblem({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/5",
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-[#cb1b2e]" />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0b4ea2]" />
    </span>
  );
}
