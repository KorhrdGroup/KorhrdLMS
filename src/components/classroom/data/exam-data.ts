import { IN_PROGRESS_COURSES } from "@/components/classroom/data/classroom-data";

/**
 * Mock data for the 학습강의실 시험 (course exam) list.
 *
 * Field names line up with the tables we expect once this is wired to
 * Supabase, so swapping mock arrays for real queries later is a drop-in
 * replacement:
 *
 *   exams            - id, course_id, title, opens_at, closes_at
 *   exam_submissions - exam_id, enrollment_id, status, submitted_at, score
 */

export type ExamStatus = "not-submitted" | "submitted";

export type CourseExam = {
  id: string;
  title: string;
  periodLabel: string;
  status: ExamStatus;
};

const EXAMS_BY_SLUG: Record<string, CourseExam[]> = {
  caregiver: [
    {
      id: "caregiver-exam-1",
      title: "간병사 수료 시험",
      periodLabel: "2026-06-30 ~ 2026-08-10",
      status: "not-submitted",
    },
  ],
};

function buildGenericExams(courseTitle: string, periodLabel: string): CourseExam[] {
  return [
    {
      id: "generic-exam-1",
      title: `${courseTitle} 수료 시험`,
      periodLabel,
      status: "not-submitted",
    },
  ];
}

export function getCourseExams(slug: string): CourseExam[] {
  if (EXAMS_BY_SLUG[slug]) return EXAMS_BY_SLUG[slug];

  const course = IN_PROGRESS_COURSES.find((item) => item.slug === slug);
  if (!course) return [];

  return buildGenericExams(course.title, course.periodLabel);
}

export function getExamStatusLabel(status: ExamStatus): string {
  return status === "submitted" ? "제출완료" : "시험 미제출";
}
