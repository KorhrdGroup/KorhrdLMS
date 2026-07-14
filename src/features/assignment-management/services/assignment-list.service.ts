import {
  listAssignments,
  seedAssignmentsOnce,
} from "@/features/assignment-management/repositories/assignment.repository";
import type {
  Assignment,
  AssignmentCourseOption,
  AssignmentFilterOptions,
  AssignmentListItem,
  AssignmentListQuery,
} from "@/features/assignment-management/types/assignment.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

function toListItem(assignment: Assignment): AssignmentListItem {
  return {
    id: assignment.id,
    courseId: assignment.courseId,
    courseName: assignment.courseName,
    title: assignment.title,
    submissionStart: assignment.submissionStart,
    submissionEnd: assignment.submissionEnd,
    isPublished: assignment.isPublished,
    submissionCount: assignment.submissions.length,
    gradedCount: assignment.submissions.filter((s) => s.status === "graded").length,
    createdAt: assignment.createdAt,
  };
}

export async function fetchAssignmentCourseOptions(): Promise<AssignmentCourseOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, code")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function ensureSeeded() {
  const courses = await fetchAssignmentCourseOptions();
  seedAssignmentsOnce(courses);
  return courses;
}

export async function getAssignmentList(
  query: AssignmentListQuery,
): Promise<PaginatedResult<AssignmentListItem>> {
  await ensureSeeded();

  let items = listAssignments().map(toListItem);

  if (query.courseId) {
    items = items.filter((item) => item.courseId === query.courseId);
  }

  if (query.publish === "published") {
    items = items.filter((item) => item.isPublished);
  } else if (query.publish === "unpublished") {
    items = items.filter((item) => !item.isPublished);
  }

  if (query.search) {
    const keyword = query.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.courseName.toLowerCase().includes(keyword),
    );
  }

  items = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const total = items.length;
  const { from, to } = getPaginationRange(query.page, query.pageSize);
  const data = items.slice(from, to + 1);

  return {
    data,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getAssignmentFilterOptions(): Promise<AssignmentFilterOptions> {
  const courses = await ensureSeeded();
  return { courses };
}
