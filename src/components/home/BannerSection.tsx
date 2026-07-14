import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { HomeContainer } from "@/components/home/home-container";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function BannerSection() {
  return (
    <section className={figmaClass.pageBg} style={{ padding: `${figma.spacing.bannerSection}px 0` }}>
      <HomeContainer>
        <div
          className="relative flex h-auto items-center overflow-hidden py-8 sm:h-[130px] sm:py-0"
          style={{
            borderRadius: figma.radius.card,
            backgroundColor: figma.colors.primary,
          }}
        >
          <div className="relative z-10 flex-1 px-7 sm:px-9">
            <h2 className="text-[22px] leading-[1.35] font-bold text-white sm:text-[24px]">
              직업능력강화 스펙업!
              <br />
              100세 시대! 제2의 직업 능력이 필요할 때입니다.
            </h2>
            <p className="mt-2 text-[13px] font-medium text-white/70">
              한평생직업훈련센터의 자격증은 국가지정기관 정식등록자격증입니다.
            </p>
          </div>

          <div className="relative mr-6 hidden size-[110px] shrink-0 sm:block lg:mr-14 lg:size-[130px]">
            <Image src="/images/home/ic-specup.png" alt="" fill className="object-contain" />
          </div>
        </div>
      </HomeContainer>
    </section>
  );
}

export function ConsultBanner() {
  return (
    <section className={figmaClass.pageBg} style={{ padding: `0 0 ${figma.spacing.bannerSection}px` }}>
      <HomeContainer>
        <Link
          href="#"
          className="relative flex h-[90px] items-center overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:brightness-[0.98]"
          style={{ borderRadius: figma.radius.card, backgroundColor: figma.colors.yellow }}
        >
          <div className="relative z-10 flex-1 px-7 sm:px-9">
            <p className="text-[12px] font-medium text-[#5a4a00]">한평생직업훈련센터 실시간상담</p>
            <p className="mt-1 flex items-center gap-1.5 text-[17px] font-bold text-[#1d1d1d] sm:text-[19px]">
              학습장애 및 오류, 교육상담 등 언제든지 문의주세요.
              <ChevronRight className="size-4 shrink-0" />
            </p>
          </div>

          <div className="relative mr-6 hidden h-[90px] w-[130px] shrink-0 sm:block lg:mr-10">
            <Image src="/images/home/bn-kakao.png" alt="" fill className="object-contain object-bottom" />
          </div>
        </Link>
      </HomeContainer>
    </section>
  );
}
