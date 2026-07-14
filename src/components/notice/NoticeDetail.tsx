import Link from "next/link";

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
