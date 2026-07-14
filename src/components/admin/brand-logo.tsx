import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  collapsed?: boolean;
  /** sm: 사이드바처럼 조밀한 영역용, md: 로그인 화면 등 넓은 영역용(기본값) */
  size?: "sm" | "md";
};

const LOGO_SIZE = {
  sm: "size-7",
  md: "size-10",
} as const;

const TEXT_SIZE = {
  sm: "text-[15px]",
  md: "text-lg",
} as const;

export function BrandLogo({
  className,
  collapsed = false,
  size = "md",
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        collapsed ? "justify-center" : "justify-start gap-2",
        className,
      )}
    >
      <Image
        src="/images/hanpyeong-logo.png"
        alt="한평생직업훈련"
        width={40}
        height={40}
        className={cn("shrink-0 object-contain", LOGO_SIZE[size])}
        priority
      />
      {!collapsed ? (
        <span
          className={cn(
            "truncate font-bold tracking-tight text-[#111827]",
            TEXT_SIZE[size],
          )}
        >
          한평생직업훈련
        </span>
      ) : null}
    </div>
  );
}
