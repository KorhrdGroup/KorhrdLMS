import Link from "next/link";

import type { CourseNotice } from "@/components/classroom/data/course-notice-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function CourseNoticeDetailBoard({ slug, notice }: { slug: string; notice: CourseNotice | null }) {
  if (!notice) {
    return (
      <div className="min-w-0 flex-1">
        <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>공지사항</h2>
        <div
          className={cn(
            "flex flex-col items-center gap-3 border px-6 py-20 text-center",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
          )}
        >
          <p className={cn("text-[14px]", figmaClass.textPlaceholder)}>존재하지 않는 게시물입니다.</p>
          <Link
            href={`/classroom/${slug}/notices`}
            className="flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
            style={{ borderColor: figma.colors.border }}
          >
            목록
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>공지사항</h2>

      <div className={cn("border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <div className="border-b px-6 py-5 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <h3 className={cn("text-[19px] font-bold sm:text-[21px]", figmaClass.textPrimary)}>{notice.title}</h3>
          <p className={cn("mt-2 text-[13px]", figmaClass.textPlaceholder)}>
            작성자 {notice.createdBy} · 등록일 {notice.createdAt}
          </p>
        </div>

        <div className="border-b px-6 py-8 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <p className={cn("text-[14px] leading-[1.8] whitespace-pre-line", figmaClass.textBody)}>
            {notice.content}
          </p>
        </div>

        <div className="flex justify-end px-6 py-5 sm:px-8">
          <Link
            href={`/classroom/${slug}/notices`}
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
