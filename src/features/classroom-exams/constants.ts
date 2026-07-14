import type { ClassroomExamStatus } from "@/features/classroom-exams/types/classroom-exam.types";

/**
 * 시험 응시 자격 진도율 기준(%) 기본값입니다.
 *
 * 민간자격증 LMS는 수강 진도율(출석률) 60% 이상이면 시험에 응시할 수 있습니다
 * (100% 미만이어도 응시 가능). 과정별로 다른 기준이 필요하면
 * `courses.exam_eligibility_progress_rate` 컬럼에 값을 저장하세요(0~100).
 * 해당 컬럼이 NULL인 과정은 이 기본값을 사용합니다 —
 * `getCourseExamEligibilityThreshold`(classroom-exam.service.ts) 참고.
 */
export const DEFAULT_EXAM_ELIGIBILITY_PROGRESS_RATE = 60;

export const CLASSROOM_EXAM_STATUS_LABEL: Record<ClassroomExamStatus, string> = {
  locked: "응시 불가",
  upcoming: "응시 예정",
  available: "응시 가능",
  submitted: "제출완료",
  closed: "응시기간 종료",
};

export const CLASSROOM_EXAM_STATUS_BADGE_CLASS: Record<ClassroomExamStatus, string> = {
  locked: "border border-[#e5433f]/30 bg-[#e5433f]/5 text-[#e5433f]",
  upcoming: "bg-[#f1f1f1] text-[#919191]",
  available: "border border-[#e5433f]/30 bg-[#e5433f]/5 text-[#e5433f]",
  submitted: "bg-[#e5edff] text-[#00376e]",
  closed: "bg-[#f1f1f1] text-[#919191]",
};
