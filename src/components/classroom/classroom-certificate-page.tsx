import Link from "next/link";
import { AlertCircle, ChevronRight, Home } from "lucide-react";

import { CertificateBoard } from "@/components/classroom/CertificateBoard";
import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeContainer } from "@/components/home/home-container";
import { figma, figmaClass } from "@/components/home/home-design";
import { QuickMenu } from "@/components/home/QuickMenu";
import type { ClassroomCertificateStatus } from "@/features/classroom-certificates/types/classroom-certificate.types";
import { cn } from "@/lib/utils";

/**
 * 수료증 발급 페이지. 사이드 메뉴 없이 출력/PDF 다운로드에 집중된 레이아웃으로
 * 구성하고, Header/Footer/QuickMenu 및 안내 영역은 인쇄 시 숨겨(`print:hidden`)
 * 수료증 카드만 A4 용지에 자연스럽게 인쇄되도록 합니다.
 */
export function ClassroomCertificatePage({
  slug,
  status,
}: {
  slug: string;
  status: ClassroomCertificateStatus | null;
}) {
  return (
    <div className={cn("min-h-screen", figmaClass.pageBg, "print:bg-white")}>
      <div className="print:hidden">
        <HomeHeader />
      </div>

      <main className="pb-16 print:pb-0">
        <HomeContainer className="pt-6 print:max-w-none print:p-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <h1 className={cn(figma.typography.sectionTitle, figmaClass.textPrimary)}>
              {status ? `${status.courseTitle} 수료증` : "수료증"}
            </h1>
            <nav className={cn("flex items-center gap-1.5 text-[13px]", figmaClass.textPlaceholder)} aria-label="breadcrumb">
              <Link href="/" className="flex items-center hover:text-[#00376e]">
                <Home className="size-3.5" />
              </Link>
              <ChevronRight className="size-3.5" />
              <Link href="/classroom" className="hover:text-[#00376e]">
                학습강의실
              </Link>
              <ChevronRight className="size-3.5" />
              <span className={figmaClass.textSub}>수료증</span>
            </nav>
          </div>

          {status ? (
            <CertificateBoard slug={slug} status={status} />
          ) : (
            <div
              className={cn(
                "flex flex-col items-center gap-4 border px-6 py-24 text-center",
                figmaClass.roundedCard,
                figmaClass.borderDefault,
                figmaClass.whiteBg,
              )}
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-[#e5edff]">
                <AlertCircle className="size-6" style={{ color: figma.colors.primary }} />
              </div>
              <p className={cn("text-[16px] font-semibold", figmaClass.textPrimary)}>존재하지 않는 과정입니다.</p>
              <Link
                href="/classroom"
                className="mt-2 flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
                style={{ borderColor: figma.colors.border }}
              >
                학습강의실로 돌아가기
              </Link>
            </div>
          )}
        </HomeContainer>
      </main>

      <div className="print:hidden">
        <HomeFooter />
        <QuickMenu />
      </div>
    </div>
  );
}
