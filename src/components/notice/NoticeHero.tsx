import Link from "next/link";
import { ChevronRight, Home, MessageSquareText } from "lucide-react";

import { figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function NoticeHero({ currentLabel = "공지사항" }: { currentLabel?: string }) {
  return (
    <>
      <nav
        className={cn("mb-4 flex items-center gap-1.5 text-[13px]", figmaClass.textPlaceholder)}
        aria-label="breadcrumb"
      >
        <Link href="/" className="flex items-center hover:text-[#00376e]">
          <Home className="size-3.5" />
        </Link>
        <ChevronRight className="size-3.5" />
        <span>학습지원</span>
        <ChevronRight className="size-3.5" />
        <span className={figmaClass.textSub}>{currentLabel}</span>
      </nav>

      <div
        className="relative mb-6 flex items-center overflow-hidden rounded-[10px] px-7 py-7 sm:px-9"
        style={{ backgroundColor: "#6c5ce7" }}
      >
        <div className="relative z-10">
          <h1 className="text-[22px] font-bold text-white sm:text-[26px]">한평생 직업훈련센터 학습지원</h1>
          <p className="mt-1.5 text-[13px] text-white/80">학습관련정보 및 공지사항을 확인해보세요.</p>
        </div>
        <div className="relative ml-auto hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white sm:flex">
          <MessageSquareText className="size-7 text-[#6c5ce7]" />
        </div>
      </div>
    </>
  );
}
