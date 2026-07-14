import { cn } from "@/lib/utils";

type AdminContentProps = React.ComponentProps<"main">;

export function AdminContent({ className, ...props }: AdminContentProps) {
  return (
    <main
      className={cn("flex-1 overflow-y-auto bg-[#F5F5F5] p-6", className)}
      {...props}
    />
  );
}
