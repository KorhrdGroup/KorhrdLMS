"use client";

import { getCourseLectures, type Lecture } from "@/components/classroom/data/lecture-data";

/**
 * Client-side Mock store for lecture watch progress, keyed by course slug +
 * lecture id. Backed by localStorage purely for demo/QA purposes so
 * progress (and the auto-attendance rule below) survives reloads without a
 * real backend.
 *
 * Mirrors the shape a future `lecture_progress` table would take:
 *   lecture_id, watched_percent, attendance_status, completed_at
 * so swapping this module for a Supabase mutation/query later is a
 * drop-in replacement for the components that consume it (lecture player,
 * lecture list/attendance table, classroom dashboard cards, 성적보기).
 */

export type LectureAttendanceStatus = "not-started" | "completed";

export type LectureProgressRecord = {
  watchedPercent: number;
  attendanceStatus: LectureAttendanceStatus;
  completedAt: string | null;
};

export type CourseProgressSummary = {
  totalLectures: number;
  completedLectures: number;
  /** 출석완료 차시 수 / 전체 차시 수 × 100, rounded to the nearest integer. */
  attendanceRate: number;
  completedLabel: string;
};

/** 시청률이 이 값 이상이면 자동으로 출석완료 처리됩니다. */
export const ATTENDANCE_THRESHOLD_PERCENT = 80;

const STORAGE_KEY = "hanpyeong-lecture-progress";

const DEFAULT_RECORD: LectureProgressRecord = {
  watchedPercent: 0,
  attendanceStatus: "not-started",
  completedAt: null,
};

function keyFor(slug: string, lectureId: string) {
  return `${slug}:${lectureId}`;
}

function todayLabel(): string {
  return new Date().toISOString().slice(0, 10);
}

function readStore(): Record<string, LectureProgressRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LectureProgressRecord>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, LectureProgressRecord>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota/serialization errors — this is a Mock convenience store only.
  }
}

export function getLectureProgress(slug: string, lectureId: string): LectureProgressRecord {
  const store = readStore();
  return store[keyFor(slug, lectureId)] ?? DEFAULT_RECORD;
}

/**
 * Updates a lecture's watched percentage and derives attendance from the
 * 80% rule. Once a lecture crosses the threshold it stays 출석완료 even if
 * a later update reports a lower percent (mirrors how real attendance
 * tracking doesn't revoke credit already earned).
 */
export function setWatchedPercent(slug: string, lectureId: string, percent: number): LectureProgressRecord {
  const store = readStore();
  const key = keyFor(slug, lectureId);
  const existing = store[key] ?? DEFAULT_RECORD;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const meetsThreshold = clamped >= ATTENDANCE_THRESHOLD_PERCENT;
  const wasCompleted = existing.attendanceStatus === "completed";
  const isCompleted = wasCompleted || meetsThreshold;

  const record: LectureProgressRecord = {
    watchedPercent: clamped,
    attendanceStatus: isCompleted ? "completed" : "not-started",
    completedAt: isCompleted ? (existing.completedAt ?? todayLabel()) : existing.completedAt,
  };

  store[key] = record;
  writeStore(store);
  return record;
}

/** Force-completes a lecture (100% watched) — used by the dev/QA Mock button. */
export function markLectureCompleted(slug: string, lectureId: string): LectureProgressRecord {
  return setWatchedPercent(slug, lectureId, 100);
}

/** Overlays stored progress onto a course's static Mock lecture list. */
export function getLecturesWithProgress(slug: string): Lecture[] {
  return getCourseLectures(slug).map((lecture) => {
    const progress = getLectureProgress(slug, lecture.id);
    return {
      ...lecture,
      videoProgress: progress.watchedPercent,
      attendanceStatus: progress.attendanceStatus,
      completedAt: progress.completedAt,
    };
  });
}

/** 출석완료 차시 수 / 전체 차시 수 × 100 — used by the lecture list, dashboard cards and 성적보기. */
export function getCourseProgressSummary(slug: string): CourseProgressSummary {
  const lectures = getLecturesWithProgress(slug);
  const totalLectures = lectures.length;
  const completedLectures = lectures.filter((lecture) => lecture.attendanceStatus === "completed").length;
  const attendanceRate = totalLectures === 0 ? 0 : Math.round((completedLectures / totalLectures) * 100);

  return {
    totalLectures,
    completedLectures,
    attendanceRate,
    completedLabel: `${completedLectures}강 / ${totalLectures}강`,
  };
}
