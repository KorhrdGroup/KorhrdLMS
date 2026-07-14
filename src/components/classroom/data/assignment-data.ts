import { IN_PROGRESS_COURSES } from "@/components/classroom/data/classroom-data";

/**
 * Mock data for the 학습강의실 과제 (course assignment) list.
 *
 * Field names line up with the tables we expect once this is wired to
 * Supabase, so swapping mock arrays for real queries later is a drop-in
 * replacement:
 *
 *   assignments            - id, course_id, title, description, opens_at, closes_at
 *   assignment_submissions - assignment_id, enrollment_id, content, file_name,
 *                            submitted_at, status, score
 */

export type AssignmentStatus = "not-submitted" | "submitted";

export type CourseAssignment = {
  id: string;
  title: string;
  description: string;
  periodLabel: string;
  attachmentFileName: string | null;
  status: AssignmentStatus;
};

const ASSIGNMENTS_BY_SLUG: Record<string, CourseAssignment[]> = {
  caregiver: [
    {
      id: "caregiver-assignment-1",
      title: "간병 사례 보고서 작성",
      description:
        "담당 대상자를 가정하여 상태 관찰 내용, 수행한 케어 활동, 개선이 필요한 점을 정리한 간병 사례 보고서를 작성해 제출하세요.",
      periodLabel: "2026-06-30 ~ 2026-08-10",
      attachmentFileName: "간병사례보고서_양식.hwp",
      status: "not-submitted",
    },
  ],
};

function buildGenericAssignments(courseTitle: string, periodLabel: string): CourseAssignment[] {
  return [
    {
      id: "generic-assignment-1",
      title: `${courseTitle} 실습 과제`,
      description: `${courseTitle} 교육과정에서 학습한 내용을 바탕으로 실습 과제를 작성해 제출하세요.`,
      periodLabel,
      attachmentFileName: null,
      status: "not-submitted",
    },
  ];
}

export function getCourseAssignments(slug: string): CourseAssignment[] {
  if (ASSIGNMENTS_BY_SLUG[slug]) return ASSIGNMENTS_BY_SLUG[slug];

  const course = IN_PROGRESS_COURSES.find((item) => item.slug === slug);
  if (!course) return [];

  return buildGenericAssignments(course.title, course.periodLabel);
}

export function getCourseAssignment(slug: string, id: string): CourseAssignment | null {
  return getCourseAssignments(slug).find((assignment) => assignment.id === id) ?? null;
}

export function getAssignmentStatusLabel(status: AssignmentStatus): string {
  return status === "submitted" ? "제출완료" : "미제출";
}
