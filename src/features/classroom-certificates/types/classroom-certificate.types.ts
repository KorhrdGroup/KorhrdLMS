/**
 * 학생 학습강의실 '수료증' 화면(`/classroom/[slug]/certificate`) 타입 정의입니다.
 *
 * 수료 조건 판정은 관리자 수료증관리(`src/features/completion-certificates`)의
 * `computeCompletionEligibility`를 그대로 재사용해 관리자·학생 화면의 수료
 * 판정 기준이 항상 일치하도록 합니다.
 */
export type ClassroomCertificateRecord = {
  certificateNumber: string;
  issuedAt: string;
  reissueCount: number;
};

export type ClassroomCertificateStatus = {
  courseTitle: string;
  studentName: string;
  /** 진도율(%) — lecture_progress 기준 실제 진도율 */
  progressRate: number;
  /** 시험 백분율 점수. 미응시면 null */
  examPercent: number | null;
  /** 합격여부: 총점 60점 + 진도율 60% + 시험 60점 기준 충족 여부 */
  isPassed: boolean;
  /** 수료여부: 합격 기준(진도율·시험 점수) 충족 시 true(수강기간 종료 여부 무관, 수료증 발급 가능 상태) */
  isCompleted: boolean;
  /** 이미 발급된 수료증(있으면). 발급취소된 수료증은 포함하지 않습니다. */
  certificate: ClassroomCertificateRecord | null;
};
