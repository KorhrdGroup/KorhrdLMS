import Link from "next/link";
import { Download, Paperclip } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import type { NoticeListItem } from "@/components/notice/data/notice-data";
import { cn } from "@/lib/utils";

export function NoticeDetail({ notice }: { notice: NoticeListItem }) {
  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>공지사항</h2>

      <div className={cn("border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <div className="border-b px-6 py-5 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <div className="flex items-center gap-2">
            {notice.pinned ? (
              <span className="inline-flex shrink-0 rounded bg-[#e5433f]/10 px-2 py-1 text-[11px] font-bold text-[#e5433f]">
                필독
              </span>
            ) : null}
            <h3 className={cn("text-[19px] font-bold sm:text-[21px]", figmaClass.textPrimary)}>{notice.title}</h3>
          </div>
          <p className={cn("mt-2 text-[13px]", figmaClass.textPlaceholder)}>{notice.date}</p>
        </div>

        <div className="border-b px-6 py-8 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <p className={cn("text-[14px] leading-[1.8] whitespace-pre-line", figmaClass.textBody)}>{notice.body}</p>
        </div>

        {notice.attachment ? (
          <div className="border-b px-6 py-4 sm:px-8" style={{ borderColor: figma.colors.border }}>
            <p className={cn("mb-2 text-[13px] font-semibold", figmaClass.textSub)}>첨부파일</p>
            {/*
              Supabase Storage는 교차 출처라 HTML의 download 속성이 무시되어 브라우저가
              파일을 열어버립니다. Storage가 지원하는 ?download= 쿼리를 붙이면 응답에
              Content-Disposition: attachment 가 설정되어 실제로 내려받습니다.
            */}
            <a
              href={`${notice.attachment.fileUrl}?download=${encodeURIComponent(notice.attachment.fileName)}`}
              className="inline-flex max-w-full items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] transition-colors duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
              style={{ borderColor: figma.colors.border }}
            >
              <Paperclip className="size-4 shrink-0 text-[#9CA3AF]" />
              <span className="truncate">{notice.attachment.fileName}</span>
              {notice.attachment.fileSizeLabel ? (
                <span className="shrink-0 text-[12px] text-[#9CA3AF]">
                  {notice.attachment.fileSizeLabel}
                </span>
              ) : null}
              <Download className="size-4 shrink-0 text-[#9CA3AF]" />
            </a>
          </div>
        ) : null}

        <div className="flex justify-end px-6 py-5 sm:px-8">
          <Link
            href="/notice"
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
