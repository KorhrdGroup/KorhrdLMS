import Image from "next/image";
import { Headset } from "lucide-react";

import { ENROLLMENT_BANK } from "@/components/enrollment/data/enrollment-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

/**
 * Shared "카카오 실시간상담 / 입금계좌 / 원격지원 서비스" block used at the
 * bottom of left sidebars (수강신청, 공지사항 등).
 */
export function QuickContactPanel({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <div
        className="relative overflow-hidden rounded-lg p-5 text-center"
        style={{ backgroundColor: figma.colors.yellow }}
      >
        <p className="text-[13px] font-bold text-[#3c1e1e]">카카오톡 실시간상담</p>
        <p className="mt-2 text-[12px] leading-relaxed text-[#5a4a00]">
          운영시간 10:00 ~ 18:00
          <br />
          점심시간 12:00 ~ 14:00
          <br />
          금, 토, 일, 공휴일 휴무
        </p>
        <div className="mx-auto mt-3 flex size-11 items-center justify-center rounded-full bg-[#3c1e1e]/10">
          <span className="text-[10px] font-bold text-[#3c1e1e]">TALK</span>
        </div>
      </div>

      <div className={cn("mt-4 border p-5 text-center", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <p className={cn("text-[13px] font-semibold", figmaClass.textPrimary)}>입금계좌</p>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <Image
            src="/images/home/ic-bank.svg"
            alt={ENROLLMENT_BANK.bankName}
            width={80}
            height={21}
            className="h-[16px] w-auto object-contain"
          />
        </div>
        <p className={cn("mt-1 text-[16px] font-bold", figmaClass.textPrimary)}>{ENROLLMENT_BANK.account}</p>
        <p className={cn("mt-0.5 text-[12px]", figmaClass.textPlaceholder)}>
          예금주 : {ENROLLMENT_BANK.holder}
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.alert("[Mock] 원격지원 서비스 프로그램을 준비 중입니다.")}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-bold text-white transition-all duration-200 hover:brightness-110"
        style={{ backgroundColor: figma.colors.primary }}
      >
        <Headset className="size-4" />
        원격지원 서비스
      </button>
    </div>
  );
}
