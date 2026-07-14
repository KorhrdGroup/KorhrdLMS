import Link from "next/link";

import type { CourseNotice } from "@/components/classroom/data/course-notice-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function CourseNoticeListBoard({ slug, notices }: { slug: string; notices: CourseNotice[] }) {
  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>공지사항</h2>

      <div className={cn("overflow-x-auto border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <table className="w-full min-w-[480px] text-[14px]">
          <thead>
            <tr className="border-b bg-[#f7f8fa]" style={{ borderColor: figma.colors.border }}>
              <th className="w-[80px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">번호</th>
              <th className="py-3 pl-4 text-left text-[13px] font-semibold text-[#3d3d3d]">내용</th>
              <th className="w-[120px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">날짜</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice) => (
              <tr
                key={notice.id}
                className="border-b transition-colors duration-200 last:border-0 hover:bg-[#f4f8ff]"
                style={{ borderColor: figma.colors.border }}
              >
                <td className={cn("py-3.5 text-center", figmaClass.textPlaceholder)}>
                  <Link href={`/classroom/${slug}/notices/${notice.id}`} className="block">
                    {notice.seq}
                  </Link>
                </td>
                <td className="py-3.5 pl-4">
                  <Link
                    href={`/classroom/${slug}/notices/${notice.id}`}
                    className={cn(
                      "transition-colors duration-200 hover:text-[#00376e] hover:underline",
                      figmaClass.textBody,
                    )}
                  >
                    {notice.title}
                  </Link>
                </td>
                <td className={cn("py-3.5 text-center text-[13px]", figmaClass.textPlaceholder)}>
                  {notice.createdAt}
                </td>
              </tr>
            ))}
            {notices.length === 0 ? (
              <tr>
                <td colSpan={3} className={cn("py-16 text-center text-[14px]", figmaClass.textPlaceholder)}>
                  등록된 게시물이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
