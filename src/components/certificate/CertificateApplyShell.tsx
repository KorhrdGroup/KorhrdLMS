import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { CertificateSidebar } from "@/components/certificate/CertificateSidebar";
import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeContainer } from "@/components/home/home-container";
import { figma, figmaClass } from "@/components/home/home-design";
import { QuickMenu } from "@/components/home/QuickMenu";
import { cn } from "@/lib/utils";

/**
 * 자격증발급신청/조회 공통 레이아웃(breadcrumb + 배너 + 좌측 메뉴).
 * 수강신청 화면(`EnrollmentPage`)과 동일한 톤을 사용합니다.
 */
export function CertificateApplyShell({
  currentLabel,
  children,
}: {
  currentLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-h-screen", figmaClass.pageBg)}>
      <HomeHeader />

      <main className="pb-16">
        <HomeContainer className="pt-4">
          <nav
            className={cn("mb-4 flex items-center gap-1.5 text-[13px]", figmaClass.textPlaceholder)}
            aria-label="breadcrumb"
          >
            <Link href="/" className="flex items-center hover:text-[#00376e]">
              <Home className="size-3.5" />
            </Link>
            <ChevronRight className="size-3.5" />
            <span>자격증발급</span>
            <ChevronRight className="size-3.5" />
            <span className={figmaClass.textSub}>{currentLabel}</span>
          </nav>

          <div
            className="relative mb-6 flex items-center overflow-hidden rounded-[10px] px-7 py-7 sm:px-9"
            style={{ backgroundColor: figma.colors.primary }}
          >
            <div className="relative z-10">
              <h1 className="text-[22px] font-bold text-white sm:text-[26px]">
                국가 지정기관 정식등록 자격증
              </h1>
              <p className="mt-1.5 text-[13px] text-white/70">
                학습자분들의 자격취득을 응원합니다!
              </p>
            </div>
            <div className="relative ml-auto hidden size-[64px] shrink-0 sm:block">
              <Image src="/images/home/ic-specup.png" alt="" fill className="object-contain" />
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <CertificateSidebar />

            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </HomeContainer>
      </main>

      <HomeFooter />
      <QuickMenu />
    </div>
  );
}
