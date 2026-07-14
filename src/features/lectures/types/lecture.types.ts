import type { VideoSource } from "@/types/database.types";

/**
 * 강의(Lecture) 타입 정의입니다.
 * Supabase 테이블 매핑:
 * - Lecture        → course_lectures (courses.id 연결)
 * - LectureSession → lecture_sessions (session_order, title, duration_minutes, video_*)
 */
export type LectureSession = {
  id: string;
  order: number;
  title: string;
  /** 학습시간(분). 관리자가 차시 등록 시 입력하지 않으면 null입니다. */
  durationMinutes: number | null;
  /** 재생에 사용하는 실제 URL(Supabase Storage 공개 URL 또는 외부 CDN URL). 미등록 시 null. */
  videoUrl: string | null;
  /** 영상 저장 방식. storage=Supabase Storage 업로드, external=외부 URL 직접 입력. */
  videoSource: VideoSource;
  /** 업로드/등록된 영상의 원본 파일명(표시용). */
  videoFileName: string | null;
  /** 영상 실제 재생 길이(초). 진도율(%) 계산 기준입니다. */
  videoDurationSeconds: number | null;
  /** videoSource가 storage일 때의 Storage 오브젝트 경로(교체/삭제 시 사용). */
  videoStoragePath: string | null;
  /** 영상 등록/교체 완료 시각. null이면 아직 업로드되지 않은 차시입니다. */
  videoUploadedAt: string | null;
};

export type Lecture = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  /** 실제 업로드 없이 파일명만 저장하는 임시(Mock) 썸네일 필드입니다. */
  thumbnailFileName: string | null;
  isPublished: boolean;
  createdAt: string;
  sessions: LectureSession[];
};

export type LectureListItem = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  thumbnailFileName: string | null;
  isPublished: boolean;
  sessionCount: number;
  createdAt: string;
};

export type LectureCourseOption = {
  id: string;
  name: string;
  code: string;
};

/** 다른 도메인(시험관리 등)에서 강의를 선택할 때 사용하는 경량 옵션 타입입니다. */
export type LectureOption = {
  id: string;
  title: string;
  courseName: string;
  isPublished: boolean;
};

export type LectureFilterOptions = {
  courses: LectureCourseOption[];
};

export type LecturePublishFilter = "" | "published" | "unpublished";

export type LectureListQuery = {
  page: number;
  pageSize: number;
  search: string;
  courseId: string;
  publish: LecturePublishFilter;
};

export type LectureRegistrationInput = {
  courseId: string;
  title: string;
  description: string;
  thumbnailFileName: string;
  isPublished: boolean;
};

export type LectureRegistrationResult =
  | { success: true; lectureId: string; message: string }
  | {
      success: false;
      message: string;
      field?: keyof LectureRegistrationInput;
    };

export type LectureEditInput = LectureRegistrationInput;

export type LectureEditDetail = LectureEditInput & {
  id: string;
  courseName: string;
};

export type LectureEditResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof LectureEditInput };

export type GetLectureForEditResult =
  | { success: true; lecture: LectureEditDetail }
  | { success: false; message: string };

export type LectureDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
