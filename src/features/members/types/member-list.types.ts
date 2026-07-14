import type { MemberCourseSummaryItem } from "@/features/members/types/member-course-summary.types";
import type { MemberListItem } from "@/types/database.types";

export type MemberListRow = MemberListItem & {
  courses: MemberCourseSummaryItem[];
};
