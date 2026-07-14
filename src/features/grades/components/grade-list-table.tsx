"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminButton } from "@/components/admin/ui/admin-button";
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

type GradeListResult = {
  data: GradeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type GradeListTableProps = {
  result: GradeListResult;
};

export function GradeListTable({ result }: GradeListTableProps) {
  const router = useRouter();

  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-14">No</AdminTableHead>
            <AdminTableHead>회원명</AdminTableHead>
            <AdminTableHead>아이디</AdminTableHead>
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>출석점수</AdminTableHead>
            <AdminTableHead>시험점수</AdminTableHead>
            <AdminTableHead>과제점수</AdminTableHead>
            <AdminTableHead>총점</AdminTableHead>
            <AdminTableHead>등급</AdminTableHead>
            <AdminTableHead>합격여부</AdminTableHead>
            <AdminTableHead>수료여부</AdminTableHead>
            <AdminTableHead className="w-24 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item, index) => {
            const rowNumber = result.total - (result.page - 1) * result.pageSize - index;

            return (
              <AdminTableRow key={item.enrollmentId}>
                <AdminTableCell className="text-[#6B7280]">{rowNumber}</AdminTableCell>
                <AdminTableCell className="font-medium">{item.member.name}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">{item.member.loginId}</AdminTableCell>
                <AdminTableCell>{item.course.name}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">{item.attendanceRate}점</AdminTableCell>
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
                    <AdminButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/grades/${item.enrollmentId}`)}
                    >
                      <Pencil className="size-4" />
                      수정
                    </AdminButton>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
