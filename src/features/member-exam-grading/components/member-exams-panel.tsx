import Link from "next/link";

import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { GradePassBadge } from "@/features/grades/components/grade-pass-badge";
import type { MemberExamListItem } from "@/features/member-exam-grading/types/member-exam-grading.types";

type MemberExamsPanelProps = {
  memberId: string;
  items: MemberExamListItem[];
};

/**
 * 회원 상세 > 시험관리 탭 — 수강 과정별 수료시험 응시 상태와 "채점하기" 진입.
 * 제출된 시험지만 채점할 수 있습니다(학생이 먼저 시험을 봐야 합니다).
 */
export function MemberExamsPanel({ memberId, items }: MemberExamsPanelProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#9CA3AF]">
        수강 중인 과정이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>수료시험</AdminTableHead>
            <AdminTableHead>상태</AdminTableHead>
            <AdminTableHead>점수</AdminTableHead>
            <AdminTableHead>합격여부</AdminTableHead>
            <AdminTableHead className="w-24 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {items.map((item) => (
            <AdminTableRow key={item.enrollmentId}>
              <AdminTableCell className="font-medium">{item.courseName}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">{item.examName ?? "—"}</AdminTableCell>
              <AdminTableCell>
                {item.status === "submitted" ? (
                  <span className="inline-flex rounded-md bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#3182F6]">
                    제출됨 · {item.submittedAt}
                  </span>
                ) : item.status === "not_taken" ? (
                  <span className="inline-flex rounded-md bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#9CA3AF]">
                    미응시
                  </span>
                ) : (
                  <span className="inline-flex rounded-md bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#9CA3AF]">
                    시험 없음
                  </span>
                )}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {item.status === "submitted" && item.score != null ? (
                  <>
                    <span className="font-semibold text-[#111827]">{item.score}점</span>
                    <span className="ml-1 text-xs text-[#9CA3AF]">/ 기준 {item.passScore}</span>
                    {item.manualCount > 0 ? (
                      <span className="ml-1.5 rounded bg-[#FFF7ED] px-1.5 py-0.5 text-[11px] text-[#C2410C]">
                        정답처리 {item.manualCount}
                      </span>
                    ) : null}
                  </>
                ) : (
                  "—"
                )}
              </AdminTableCell>
              <AdminTableCell>
                {item.status === "submitted" && item.isPassed != null ? (
                  <GradePassBadge isPassed={item.isPassed} />
                ) : (
                  <span className="text-[#9CA3AF]">—</span>
                )}
              </AdminTableCell>
              <AdminTableCell>
                {item.status === "submitted" && item.submissionId ? (
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/members/${memberId}/exams/${item.submissionId}`}
                      className="text-sm text-[#3B82F6] hover:underline"
                    >
                      채점하기
                    </Link>
                  </div>
                ) : null}
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
