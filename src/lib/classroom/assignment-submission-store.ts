"use client";

import { getCourseAssignments, type CourseAssignment } from "@/components/classroom/data/assignment-data";

/**
 * Client-side Mock store for assignment submissions, keyed by course slug +
 * assignment id. Backed by localStorage purely for demo/QA purposes so
 * submissions survive reloads without a real backend.
 *
 * Mirrors the shape a future `assignment_submissions` table would take:
 *   assignment_id, enrollment_id, content, file_name, submitted_at, status, score
 * so swapping this module for a Supabase mutation/query later is a
 * drop-in replacement for the components that consume it (assignment list,
 * assignment detail/submit form, 성적보기).
 */

export type AssignmentSubmissionStatus = "not-submitted" | "submitted";

export type AssignmentSubmissionRecord = {
  content: string;
  fileName: string | null;
  submittedAt: string;
  status: AssignmentSubmissionStatus;
  /** Mock 채점 — 실제 채점 로직 연동 전까지 제출 시 100점으로 고정합니다. */
  score: number | null;
};

const STORAGE_KEY = "hanpyeong-assignment-submissions";

function keyFor(slug: string, assignmentId: string) {
  return `${slug}:${assignmentId}`;
}

function readStore(): Record<string, AssignmentSubmissionRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AssignmentSubmissionRecord>) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, AssignmentSubmissionRecord>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota/serialization errors — this is a Mock convenience store only.
  }
}

export function getAssignmentSubmission(slug: string, assignmentId: string): AssignmentSubmissionRecord | null {
  const store = readStore();
  return store[keyFor(slug, assignmentId)] ?? null;
}

export function submitAssignment(
  slug: string,
  assignmentId: string,
  input: { content: string; fileName: string | null },
): AssignmentSubmissionRecord {
  const store = readStore();
  const record: AssignmentSubmissionRecord = {
    content: input.content,
    fileName: input.fileName,
    submittedAt: new Date().toISOString(),
    status: "submitted",
    score: 100,
  };
  store[keyFor(slug, assignmentId)] = record;
  writeStore(store);
  return record;
}

/** Overlays stored submission status onto a course's static Mock assignment list. */
export function getAssignmentsWithStatus(slug: string): CourseAssignment[] {
  return getCourseAssignments(slug).map((assignment) => {
    const submission = getAssignmentSubmission(slug, assignment.id);
    return submission ? { ...assignment, status: submission.status } : assignment;
  });
}
