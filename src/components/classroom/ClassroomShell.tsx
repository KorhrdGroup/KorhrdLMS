import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeContainer } from "@/components/home/home-container";
import { figma, figmaClass } from "@/components/home/home-design";
import { QuickMenu } from "@/components/home/QuickMenu";
import { cn } from "@/lib/utils";

export function ClassroomShell({
  currentLabel = "학습강의실",
  children,
}: {
  currentLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-h-screen", figmaClass.pageBg)}>
      <HomeHeader />

      <main className="pb-16">
        <HomeContainer className="pt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <h1 className={cn(figma.typography.sectionTitle, figmaClass.textPrimary)}>학습강의실</h1>
            <nav
              className={cn("flex items-center gap-1.5 text-[13px]", figmaClass.textPlaceholder)}
              aria-label="breadcrumb"
            >
              <Link href="/" className="flex items-center hover:text-[#00376e]">
                <Home className="size-3.5" />
              </Link>
              <ChevronRight className="size-3.5" />
              <span className={figmaClass.textSub}>{currentLabel}</span>
            </nav>
          </div>

          {children}
        </HomeContainer>
      </main>

      <HomeFooter />
      <QuickMenu />
    </div>
  );
}
