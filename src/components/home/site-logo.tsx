import Link from "next/link";
import Image from "next/image";

import { figma } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  variant?: "header" | "hero";
};

export function SiteLogo({ className, variant = "header" }: SiteLogoProps) {
  const isHero = variant === "hero";

  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/logo.png"
        alt="한평생직업훈련"
        width={isHero ? 216 : figma.layout.gnbLogoWidth}
        height={isHero ? 50 : figma.layout.gnbLogoHeight}
        className={cn(
          "w-auto object-contain object-left",
          isHero ? "h-[50px] w-[216px]" : "h-[46px] w-[200px]",
        )}
        priority
      />
    </Link>
  );
}
