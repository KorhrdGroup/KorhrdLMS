import type { ClassroomLectureStatus } from "@/features/classroom-lectures/types/classroom-lecture.types";

export const CLASSROOM_LECTURE_STATUS_LABEL: Record<ClassroomLectureStatus, string> = {
  not_started: "미수강",
  in_progress: "학습중",
  completed: "완료",
};

export const CLASSROOM_LECTURE_STATUS_BADGE_CLASS: Record<ClassroomLectureStatus, string> = {
  not_started: "bg-[#F0F0F0] text-[#6B7280]",
  in_progress: "bg-[#e5edff] text-[#1257ee]",
  completed: "bg-[#e6f6ec] text-[#1a7d3c]",
};

/** 영상 시청 진행률이 이 값(%) 이상이면 자동으로 "학습완료" 처리합니다. */
export const VIDEO_COMPLETION_THRESHOLD_PERCENT = 95;

/** 진도율 저장(서버 액션 호출)을 위한 재생 중 최소 간격(초). */
export const VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS = 8;
