"use client";

import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { useState } from "react";

import { figma, figmaClass } from "@/components/home/home-design";
import { MOCK_USER_NAME } from "@/lib/mock-auth";
import { createTicket } from "@/lib/support/ticket-store";
import { cn } from "@/lib/utils";

export function QnaWrite() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleConfirm = () => {
    if (!title.trim() || !content.trim()) {
      window.alert("제목과 상담내용을 입력해주세요.");
      return;
    }

    createTicket({ title: title.trim(), content: content.trim() });
    window.alert("게시물 등록을 완료하였습니다.");
    router.push("/support/qna");
  };

  const handleCancel = () => {
    router.push("/support/qna");
  };

  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>1:1 상담</h2>

      <div className={cn("overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <div className="flex items-center justify-center gap-1.5 bg-[#f4f8ff] px-4 py-3 text-center text-[13px] text-[#00376e]">
          <Info className="size-4 shrink-0" />
          상담하실 내용을 적으시면 신속하게 답변해 드리겠습니다.
        </div>

        <div className="divide-y" style={{ borderColor: figma.colors.border }}>
          <div className="flex items-center gap-4 px-5 py-4 sm:px-6" style={{ borderColor: figma.colors.border }}>
            <label className={cn("w-20 shrink-0 text-[14px] font-semibold sm:w-24", figmaClass.textBody)}>
              이름
            </label>
            <input
              type="text"
              value={MOCK_USER_NAME}
              readOnly
              className="h-10 w-full max-w-[240px] rounded-md border bg-[#f7f8fa] px-3 text-[13px] text-[#656565]"
              style={{ borderColor: figma.colors.border }}
            />
          </div>

          <div className="flex items-center gap-4 px-5 py-4 sm:px-6" style={{ borderColor: figma.colors.border }}>
            <label className={cn("w-20 shrink-0 text-[14px] font-semibold sm:w-24", figmaClass.textBody)}>
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력해주세요."
              className={cn(
                "h-10 min-w-0 flex-1 rounded-md border px-3 text-[13px] outline-none transition-colors duration-200 focus:border-[#00376e]",
                figmaClass.borderDefault,
              )}
            />
          </div>

          <div className="flex items-start gap-4 px-5 py-4 sm:px-6" style={{ borderColor: figma.colors.border }}>
            <label className={cn("w-20 shrink-0 pt-2 text-[14px] font-semibold sm:w-24", figmaClass.textBody)}>
              상담내용
            </label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="상담하실 내용을 입력해주세요."
              rows={8}
              className={cn(
                "min-w-0 flex-1 resize-none rounded-md border px-3 py-2.5 text-[13px] outline-none transition-colors duration-200 focus:border-[#00376e]",
                figmaClass.borderDefault,
              )}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2.5">
        <button
          type="button"
          onClick={handleConfirm}
          className="flex h-11 w-28 items-center justify-center rounded-lg text-[14px] font-bold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: figma.colors.primary }}
        >
          확인
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className={cn(
            "flex h-11 w-28 items-center justify-center rounded-lg border text-[14px] font-bold transition-all duration-200 hover:bg-[#f4f4f4]",
            figmaClass.textSub,
            figmaClass.borderDefault,
          )}
        >
          취소
        </button>
      </div>
    </div>
  );
}
