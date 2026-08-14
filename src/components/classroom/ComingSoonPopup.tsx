"use client";

import { useState } from "react";

import { figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

/**
 * 학습강의실에서 아직 준비되지 않은 콘텐츠(교안·시험) 안내 팝업.
 * 자료가 없는 화면에 들어오면 한 번 띄우고, 확인을 누르면 닫힙니다.
 */
export function ComingSoonPopup({ title, message }: { title: string; message: string }) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-[rgba(15,18,25,0.55)] p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className={cn("w-full max-w-[400px] rounded-2xl bg-white p-7 text-center shadow-xl")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[22px]">
          📢
        </div>
        <h3 className={cn("text-[17px] font-bold", figmaClass.textPrimary)}>{title}</h3>
        <p className={cn("mt-2 whitespace-pre-line text-[14px] leading-relaxed", figmaClass.textBody)}>
          {message}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-5 w-full rounded-xl bg-[#1B3765] py-3 text-[15px] font-semibold text-white"
        >
          확인
        </button>
      </div>
    </div>
  );
}
