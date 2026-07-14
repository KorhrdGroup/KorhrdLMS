import Link from "next/link";

import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { GradeCompletionBadge } from "@/features/grades/components/grade-completion-badge";
import { GradeLetterBadge } from "@/features/grades/components/grade-letter-badge";
import { GradePassBadge } from "@/features/grades/components/grade-pass-badge";
import type { GradeListItem } from "@/features/grades/types/grade.types";

type MemberGradesPanelProps = {
  grades: GradeListItem[];
};

export function MemberGradesPanel({ grades }: MemberGradesPanelProps) {
  if (grades.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 성적 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>출석점수</AdminTableHead>
            <AdminTableHead>시험점수</AdminTableHead>
            <AdminTableHead>과제점수</AdminTableHead>
            <AdminTableHead>총점</AdminTableHead>
            <AdminTableHead>등급</AdminTableHead>
            <AdminTableHead>합격여부</AdminTableHead>
            <AdminTableHead>수료여부</AdminTableHead>
            <AdminTableHead className="w-20 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {grades.map((item) => (
            <AdminTableRow key={item.enrollmentId}>
              <AdminTableCell className="font-medium">{item.course.name}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {item.attendanceRate}점
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {item.examPercent != null ? `${item.examPercent}점` : "미응시"}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {item.assignmentScore != null ? `${item.assignmentScore}점` : "미제출"}
              </AdminTableCell>
              <AdminTableCell className="font-semibold text-[#111827]">
                {item.totalScore}점
              </AdminTableCell>
              <AdminTableCell>
                <GradeLetterBadge grade={item.grade} />
              </AdminTableCell>
              <AdminTableCell>
                <GradePassBadge isPassed={item.isPassed} />
              </AdminTableCell>
              <AdminTableCell>
                <GradeCompletionBadge isCompleted={item.isCompleted} />
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex justify-end">
                  <Link
                    href={`/admin/grades/${item.enrollmentId}`}
                    className="text-sm text-[#3B82F6] hover:underline"
                  >
                    상세
                  </Link>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
