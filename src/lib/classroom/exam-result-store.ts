"use client";

/**
 * Client-side Mock store for exam submission results, keyed by course slug
 * + exam id. Backed by localStorage purely for demo/QA purposes.
 *
 * Mirrors the shape a future `exam_submissions` table would take:
 *   exam_id, enrollment_id, score, submitted_at, status
 * so swapping this module for a Supabase mutation/query later is a
 * drop-in replacement for the components that consume it (exam taking
 * screen, exam list, 성적보기).
 */

export type ExamResultStatus = "not-submitted" | "submitted";

export type ExamResultRecord = {
  examScore: number;
  submittedAt: string;
  status: ExamResultStatus;
};

const STORAGE_KEY = "hanpyeong-exam-results";

function keyFor(slug: string, examId: string) {
  return `${slug}:${examId}`;
}

function readStore(): Record<string, ExamResultRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ExamResultRecord>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, ExamResultRecord>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota/serialization errors — this is a Mock convenience store only.
  }
}

export function getExamResult(slug: string, examId: string): ExamResultRecord | null {
  const store = readStore();
  return store[keyFor(slug, examId)] ?? null;
}

export function submitExamResult(slug: string, examId: string, examScore: number): ExamResultRecord {
  const store = readStore();
  const record: ExamResultRecord = {
    examScore: Math.max(0, Math.min(100, Math.round(examScore))),
    submittedAt: new Date().toISOString(),
    status: "submitted",
  };
  store[keyFor(slug, examId)] = record;
  writeStore(store);
  return record;
}
