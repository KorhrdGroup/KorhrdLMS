import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { CourseSideMenu, type CourseMenuId } from "@/components/classroom/CourseSideMenu";
import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeContainer } from "@/components/home/home-container";
import { figma, figmaClass } from "@/components/home/home-design";
import { QuickMenu } from "@/components/home/QuickMenu";
import { cn } from "@/lib/utils";

export function ClassroomCourseShell({
  courseTitle,
  slug,
  pageTitle,
  breadcrumbLabel,
  activeMenuId = "exam",
  children,
}: {
  courseTitle: string;
  slug: string;
  pageTitle?: string;
  breadcrumbLabel?: string;
  activeMenuId?: CourseMenuId;
  children: React.ReactNode;
}) {
  const heading = pageTitle ?? courseTitle;

  return (
    <div className={cn("min-h-screen", figmaClass.pageBg)}>
      <HomeHeader />

      <main className="pb-16">
        <HomeContainer className="pt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <h1 className={cn(figma.typography.sectionTitle, figmaClass.textPrimary)}>{heading}</h1>
            <nav
              className={cn("flex items-center gap-1.5 text-[13px]", figmaClass.textPlaceholder)}
              aria-label="breadcrumb"
            >
              <Link href="/" className="flex items-center hover:text-[#00376e]">
                <Home className="size-3.5" />
              </Link>
              <ChevronRight className="size-3.5" />
              <Link href="/classroom" className="hover:text-[#00376e]">
                학습강의실
              </Link>
              <ChevronRight className="size-3.5" />
              <span className={figmaClass.textSub}>{breadcrumbLabel ?? heading}</span>
            </nav>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <CourseSideMenu courseTitle={courseTitle} slug={slug} activeId={activeMenuId} />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </HomeContainer>
      </main>

      <HomeFooter />
      <QuickMenu />
    </div>
  );
}
