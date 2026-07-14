/**
 * Mock data for the 학습강의실 (classroom) dashboard.
 *
 * "수강신청중인 과목" (pending applications) is wired to real Supabase
 * `enrollments` data — see `getMyPendingEnrollments`
 * (`src/features/enrollment-catalog/services/my-enrollments.service.ts`).
 *
 * "수강중인 과목" / "수강완료 과목" are still mock pending a full migration
 * of the lecture/progress/exam data model:
 *
 *   enrollments        - id, user_id, course_id, status, applied_at
 *   courses            - id, slug, title, professor_name
 *   lecture_progress   - enrollment_id, progress_rate, exam_submitted
 *   exams              - enrollment_id, submitted_at
 *   assignments        - enrollment_id, submitted_at
 */

export type InProgressCourse = {
  id: string;
  slug: string;
  title: string;
  periodLabel: string;
  examSubmitted: boolean;
  progressRate: number;
};

export type CompletedCourse = {
  id: string;
  title: string;
  periodLabel: string;
  professorName: string;
};

export const IN_PROGRESS_COURSES: InProgressCourse[] = [
  {
    id: "enr-1",
    slug: "caregiver",
    title: "간병사",
    periodLabel: "2026-06-30 ~ 2026-08-10",
    examSubmitted: false,
    progressRate: 0,
  },
  {
    id: "enr-2",
    slug: "elderly-care-supporter",
    title: "노인돌봄생활지원사",
    periodLabel: "2026-06-30 ~ 2026-08-10",
    examSubmitted: false,
    progressRate: 0,
  },
];

export const COMPLETED_COURSES: CompletedCourse[] = [
  {
    id: "done-1",
    title: "방과후수학지도사&스토리텔링수학지도사",
    periodLabel: "2022-01-11 ~ 2022-02-21",
    professorName: "김민서",
  },
  {
    id: "done-2",
    title: "심리상담사1급",
    periodLabel: "2022-01-11 ~ 2022-02-21",
    professorName: "이동집",
  },
  {
    id: "done-3",
    title: "독서논술지도사1급",
    periodLabel: "2022-01-25 ~ 2022-03-07",
    professorName: "임미영",
  },
  {
    id: "done-4",
    title: "방과후학교지도사1급",
    periodLabel: "2022-01-25 ~ 2022-03-07",
    professorName: "김선수",
  },
];
