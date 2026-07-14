import { cn } from "@/lib/utils";

type HomeContainerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function HomeContainer({ children, className, style }: HomeContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-0", className)}
      style={style}
    >
      {children}
    </div>
  );
}
