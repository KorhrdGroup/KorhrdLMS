import type { LectureSession } from "@/features/lectures/types/lecture.types";
import type { VideoSource } from "@/types/database.types";

export type LectureCurriculumSummary = {
  lectureId: string;
  lectureTitle: string;
  courseName: string;
  isPublished: boolean;
  sessionCount: number;
};

export type GetLectureCurriculumResult =
  | { success: true; summary: LectureCurriculumSummary; sessions: LectureSession[] }
  | { success: false; message: string };

export type GetLectureSessionResult =
  | { success: true; session: LectureSession }
  | { success: false; message: string };

export type SessionActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

export type SessionMoveDirection = "up" | "down";

export type SetLectureSessionVideoInput = {
  videoUrl: string;
  videoSource: VideoSource;
  videoFileName?: string | null;
  videoDurationSeconds?: number | null;
  /** videoSource가 "storage"일 때만 사용합니다. */
  videoStoragePath?: string | null;
};
