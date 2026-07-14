import type {
  Assignment,
  AssignmentSubmission,
  SubmissionStatus,
} from "@/features/assignment-management/types/assignment.types";

/**
 * 과제관리(/admin/assignments) Repository 계층입니다.
 *
 * 현재는 서버 메모리 Mock 배열로 동작합니다(서버 재시작 시 초기화).
 * 추후 Supabase 연동 시, 이 파일이 export하는 함수 시그니처는 그대로 둔 채
 * 내부 구현만 Supabase 쿼리로 교체하면 서비스 계층(services/*)은 수정할 필요가 없습니다.
 */

let assignments: Assignment[] = [];
let seeded = false;

function generateId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

type SeedCourse = { id: string; name: string };

function buildSeedSubmissions(base: Date): AssignmentSubmission[] {
  return [
    {
      id: generateId("submission"),
      studentName: "김민수",
      studentEmail: "minsu.kim@example.com",
      submittedAt: addDays(base, 1).toISOString(),
      fileName: "1차과제_김민수.pdf",
      status: "graded",
      score: 92,
      feedback: "핵심 내용을 잘 정리했습니다. 다음 과제에서는 사례를 더 보강해보세요.",
    },
    {
      id: generateId("submission"),
      studentName: "이지현",
      studentEmail: "jihyun.lee@example.com",
      submittedAt: addDays(base, 2).toISOString(),
      fileName: "과제제출_이지현.docx",
      status: "submitted",
      score: null,
      feedback: null,
    },
    {
      id: generateId("submission"),
      studentName: "박서준",
      studentEmail: "seojun.park@example.com",
      submittedAt: addDays(base, 3).toISOString(),
      fileName: null,
      status: "submitted",
      score: null,
      feedback: null,
    },
  ];
}

export function seedAssignmentsOnce(seedCourses: SeedCourse[]) {
  if (seeded) {
    return;
  }
  seeded = true;

  if (seedCourses.length === 0) {
    return;
  }

  const primary = seedCourses[0];
  const secondary = seedCourses[1] ?? seedCourses[0];
  const now = new Date();

  assignments = [
    {
      id: generateId("assignment"),
      courseId: primary.id,
      courseName: primary.name,
      title: `${primary.name} 1차 과제 - 학습 계획서`,
      description: "본인의 학습 목표와 4주간의 학습 계획을 A4 1매 분량으로 작성하여 제출하세요.",
      submissionStart: toDateInput(now),
      submissionEnd: toDateInput(addDays(now, 14)),
      allowAttachment: true,
      maxUploadSizeMb: 10,
      isPublished: true,
      createdAt: now.toISOString(),
      submissions: buildSeedSubmissions(now),
    },
    {
      id: generateId("assignment"),
      courseId: secondary.id,
      courseName: secondary.name,
      title: `${secondary.name} 2차 과제 - 실습 보고서`,
      description: "실습 과정에서 습득한 내용을 정리한 보고서를 제출하세요.",
      submissionStart: toDateInput(addDays(now, 15)),
      submissionEnd: toDateInput(addDays(now, 29)),
      allowAttachment: true,
      maxUploadSizeMb: 20,
      isPublished: false,
      createdAt: now.toISOString(),
      submissions: [],
    },
  ];
}

export function listAssignments(): Assignment[] {
  return assignments;
}

export function findAssignmentById(assignmentId: string): Assignment | undefined {
  return assignments.find((assignment) => assignment.id === assignmentId);
}

export function createAssignmentRecord(
  input: Omit<Assignment, "id" | "createdAt" | "submissions">,
): Assignment {
  const assignment: Assignment = {
    ...input,
    id: generateId("assignment"),
    createdAt: nowIso(),
    submissions: [],
  };

  assignments = [assignment, ...assignments];
  return assignment;
}

export function updateAssignmentRecord(
  assignmentId: string,
  patch: Partial<Omit<Assignment, "id" | "submissions" | "createdAt">>,
): Assignment | undefined {
  let updated: Assignment | undefined;

  assignments = assignments.map((assignment) => {
    if (assignment.id !== assignmentId) {
      return assignment;
    }

    updated = { ...assignment, ...patch };
    return updated;
  });

  return updated;
}

export function deleteAssignmentRecord(assignmentId: string): boolean {
  const before = assignments.length;
  assignments = assignments.filter((assignment) => assignment.id !== assignmentId);
  return assignments.length < before;
}

export function findSubmissionById(
  assignmentId: string,
  submissionId: string,
): AssignmentSubmission | undefined {
  const assignment = findAssignmentById(assignmentId);
  return assignment?.submissions.find((submission) => submission.id === submissionId);
}

export function updateSubmissionRecord(
  assignmentId: string,
  submissionId: string,
  patch: { score: number | null; feedback: string | null; status: SubmissionStatus },
): boolean {
  let found = false;

  assignments = assignments.map((assignment) => {
    if (assignment.id !== assignmentId) {
      return assignment;
    }

    return {
      ...assignment,
      submissions: assignment.submissions.map((submission) => {
        if (submission.id !== submissionId) {
          return submission;
        }

        found = true;
        return { ...submission, ...patch };
      }),
    };
  });

  return found;
}
