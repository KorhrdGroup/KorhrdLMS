import {
  listExamResults,
  type ExamResultRow,
} from "@/features/exam-results/repositories/exam-result.repository";
import type {
  ExamResultListItem,
  ExamResultListQuery,
  ExamResultListResult,
} from "@/features/exam-results/types/exam-result.types";
import { getTotalPages } from "@/lib/shared/list-query";

function toListItem(row: ExamResultRow): ExamResultListItem {
  return {
    id: row.id,
    member: {
      id: row.enrollment.member.id,
      name: row.enrollment.member.name,
      loginId: row.enrollment.member.login_id,
    },
    course: {
      id: row.enrollment.course.id,
      name: row.enrollment.course.name,
    },
    exam: {
      id: row.exam.id,
      name: row.exam.name,
    },
    submittedAt: row.submitted_at,
    score: row.score,
    totalScore: row.total_score,
    isPassed: row.is_passed,
    retakeAllowed: row.retake_allowed,
    retakeAllowedAt: row.retake_allowed_at,
  };
}

export async function getExamResultList(
  query: ExamResultListQuery,
): Promise<ExamResultListResult> {
  const rows = await listExamResults();

  let items = rows
    .filter((row) => !row.enrollment.member.deleted_at)
    .map(toListItem);

  if (query.pass === "passed") {
    items = items.filter((item) => item.isPassed === true);
  } else if (query.pass === "failed") {
    items = items.filter((item) => item.isPassed === false);
  }

  if (query.search) {
    const keyword = query.search.trim().toLowerCase();

    items = items.filter((item) => {
      switch (query.field) {
        case "member_name":
          return item.member.name.toLowerCase().includes(keyword);
        case "login_id":
          return item.member.loginId.toLowerCase().includes(keyword);
        case "course_name":
          return item.course.name.toLowerCase().includes(keyword);
        case "exam_name":
          return item.exam.name.toLowerCase().includes(keyword);
        default:
          return (
            item.member.name.toLowerCase().includes(keyword) ||
            item.member.loginId.toLowerCase().includes(keyword) ||
            item.course.name.toLowerCase().includes(keyword) ||
            item.exam.name.toLowerCase().includes(keyword)
          );
      }
    });
  }

  const total = items.length;
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize;

  return {
    data: items.slice(from, to),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}
