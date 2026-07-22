import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import type { SupportQnaItem } from "@/features/support-qna/services/support-qna.service";
import { cn } from "@/lib/utils";

function getStatusLabel(status: SupportQnaItem["status"]) {
  return status === "answered" ? "답변완료" : "대기중";
}

/** 상세 데이터는 서버(board_posts)에서 조회해 prop으로 전달받습니다. */
export function QnaDetail({ ticket }: { ticket: SupportQnaItem | null }) {
  if (ticket === null) {
    return (
      <div className="min-w-0 flex-1">
        <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>1:1 상담</h2>
        <div
          className={cn(
            "flex flex-col items-center gap-3 border px-6 py-20 text-center",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
          )}
        >
          <p className={cn("text-[14px]", figmaClass.textPlaceholder)}>존재하지 않는 게시물입니다.</p>
          <Link
            href="/support/qna"
            className="flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
            style={{ borderColor: figma.colors.border }}
          >
            목록
          </Link>
        </div>
      </div>
    );
  }

  const answered = ticket.status === "answered";

  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>1:1 상담</h2>

      <div className={cn("border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <div className="border-b px-6 py-5 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                answered ? "bg-[#e5edff] text-[#00376e]" : "bg-[#f0f0f0] text-[#656565]",
              )}
            >
              {getStatusLabel(ticket.status)}
            </span>
            <h3 className={cn("text-[19px] font-bold sm:text-[21px]", figmaClass.textPrimary)}>{ticket.title}</h3>
          </div>
          <p className={cn("mt-2 text-[13px]", figmaClass.textPlaceholder)}>
            작성자 {ticket.authorName} · 등록일 {ticket.createdAt}
          </p>
        </div>

        <div className="border-b px-6 py-8 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <p className={cn("text-[14px] leading-[1.8] whitespace-pre-line", figmaClass.textBody)}>
            {ticket.content}
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="mb-3 flex items-center gap-1.5">
            <MessageSquare className="size-4 text-[#00376e]" />
            <span className={cn("text-[14px] font-bold", figmaClass.textPrimary)}>운영진 답변</span>
          </div>

          {answered ? (
            <div className="rounded-lg bg-[#f4f8ff] px-5 py-5">
              <p className={cn("text-[14px] leading-[1.8] whitespace-pre-line", figmaClass.textBody)}>
                {ticket.adminReply}
              </p>
              <p className={cn("mt-3 text-[12px]", figmaClass.textPlaceholder)}>답변일 {ticket.repliedAt}</p>
            </div>
          ) : (
            <div className="rounded-lg bg-[#f7f8fa] px-5 py-8 text-center">
              <p className={cn("text-[13px]", figmaClass.textPlaceholder)}>아직 답변이 등록되지 않았습니다.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t px-6 py-5 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <Link
            href="/support/qna"
            className={cn(
              "flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
              figmaClass.textSub,
              figmaClass.borderDefault,
            )}
          >
            목록
          </Link>
        </div>
      </div>
    </div>
  );
}
