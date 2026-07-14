/**
 * 회원목록의 "수강과정" 컬럼에 표시할 회원별 수강과정 요약 1건입니다.
 * 진행중인 과정뿐 아니라 과거에 100% 수강완료했거나 수료증까지 발급된
 * 과정도 회원의 이력으로 계속 표시되어야 하므로, enrollments 전체(확정 상태)를
 * 기준으로 만듭니다.
 */
export type MemberCourseSummaryItem = {
  enrollmentId: string;
  courseId: string;
  courseName: string;
  /** lecture_progress 기준 실제 진도율(0~100). */
  progressRate: number;
  /** 자격증(수료증)까지 발급 완료되었는지 여부. */
  certificateIssued: boolean;
  /** 목록에 그대로 표시할 라벨. 예: "진행중 60%" / "수강완료 100%" / "발급완료" */
  statusLabel: string;
};
