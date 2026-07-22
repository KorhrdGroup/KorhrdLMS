import type { MemberCourseSummaryItem } from "@/features/members/types/member-course-summary.types";
import { cn } from "@/lib/utils";

type MemberCourseSummaryListProps = {
  courses: MemberCourseSummaryItem[];
};

function badgeClassName(item: MemberCourseSummaryItem) {
  if (item.certificateIssued) {
    return "bg-[#F0FDF4] text-[#059669]";
  }

  if (item.progressRate >= 100) {
    return "bg-[#e8f3ff] text-[#1b64da]";
  }

  return "bg-[#f2f4f6] text-[#4e5968]";
}

/**
 * 회원목록 "수강과정" 컬럼. 진행중/수강완료/발급완료 과정을 모두 이력으로
 * 표시합니다(과거 100% 수강완료 과정도 사라지지 않고 계속 표시됨).
 */
export function MemberCourseSummaryList({ courses }: MemberCourseSummaryListProps) {
  if (courses.length === 0) {
    return <span className="text-xs text-[#9CA3AF]">수강 이력 없음</span>;
  }

  return (
    <ul className="flex max-w-[190px] flex-col gap-1">
      {courses.map((item) => (
        <li
          key={item.enrollmentId}
          className="flex items-center gap-1.5 text-xs leading-tight"
        >
          <span className="truncate text-[#111827]" title={item.courseName}>
            {item.courseName}
          </span>
          <span
            className={cn(
              "shrink-0 rounded px-1.5 py-0.5 font-medium whitespace-nowrap",
              badgeClassName(item),
            )}
          >
            {item.statusLabel}
          </span>
        </li>
      ))}
    </ul>
  );
}
