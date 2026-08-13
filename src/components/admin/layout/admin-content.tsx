import { cn } from "@/lib/utils";

type AdminContentProps = React.ComponentProps<"main">;

export function AdminContent({ className, ...props }: AdminContentProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
