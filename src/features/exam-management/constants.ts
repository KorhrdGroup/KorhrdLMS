import type { ExamKind } from "@/features/exam-management/types/exam.types";

/**
 * 시험 종류 라벨입니다. 민간자격증 LMS는 "최종시험"(final_exam) 하나만 사용합니다.
 * 나머지 값은 과거 데이터 표시 호환을 위해서만 남겨둡니다(신규 등록 시 선택 불가).
 */
export const EXAM_KIND_LABELS: Record<ExamKind, string> = {
  final_exam: "최종시험",
  midterm: "중간고사",
  final: "기말고사",
  mock: "모의고사",
  certificate: "자격시험",
  quiz: "퀴즈",
};

export const FINAL_EXAM_KIND: ExamKind = "final_exam";

export const EXAM_ELIGIBILITY_NOTICE =
  "시험은 학생의 수강기간 동안 응시 가능하며, 수강 진도율(출석률) 60% 이상부터 응시할 수 있습니다.";

export function getExamPublishLabel(isPublished: boolean) {
  return isPublished ? "공개" : "비공개";
}

export const EXAM_PUBLISH_FILTER_LABELS: Record<"published" | "unpublished", string> = {
  published: "공개",
  unpublished: "비공개",
};

export const EXAM_ANSWER_OPTIONS = ["1", "2", "3", "4"] as const;
