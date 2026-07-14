"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { getCourseEnrolledStudentsAction } from "@/features/courses/actions/course-enrollment.actions";
import { EnrollmentLearningStatusBadge } from "@/features/enrollments/components/enrollment-learning-status-badge";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";
import { formatDate } from "@/lib/shared/format-date";

type CourseEnrolledStudentsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
  courseName?: string;
};

export function CourseEnrolledStudentsModal({
  open,
  onOpenChange,
  courseId,
  courseName,
}: CourseEnrolledStudentsModalProps) {
  const [students, setStudents] = useState<EnrollmentRecordListItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();

  useEffect(() => {
    if (!open || !courseId) {
      return;
    }

    startLoad(async () => {
      setStudents(null);
      setErrorMessage(null);

      try {
        const result = await getCourseEnrolledStudentsAction(courseId);
        setStudents(result);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "수강생 목록을 불러오지 못했습니다.",
        );
      }
    });
  }, [open, courseId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setStudents(null);
      setErrorMessage(null);
    }
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="수강생 목록"
      description={
        courseName ? `${courseName} 과정의 수강생 현황입니다.` : "과정 수강생 현황입니다."
      }
      className="sm:max-w-3xl"
      footer={
        <AdminButton type="button" variant="outline" onClick={() => handleOpenChange(false)}>
          닫기
        </AdminButton>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-[#6B7280]">
          수강생 목록을 불러오는 중...
        </div>
      ) : errorMessage ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : students && students.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow className="hover:bg-transparent">
                <AdminTableHead>회원명</AdminTableHead>
                <AdminTableHead>아이디</AdminTableHead>
                <AdminTableHead>수강기간</AdminTableHead>
                <AdminTableHead>상태</AdminTableHead>
                <AdminTableHead>진도율</AdminTableHead>
                <AdminTableHead>수료여부</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {students.map((student) => (
                <AdminTableRow key={student.id}>
                  <AdminTableCell className="font-medium">
                    {student.member.name}
                  </AdminTableCell>
                  <AdminTableCell className="text-[#6B7280]">
                    {student.member.login_id}
                  </AdminTableCell>
                  <AdminTableCell className="text-[#6B7280]">
                    {formatDate(student.start_date)} ~ {formatDate(student.end_date)}
                  </AdminTableCell>
                  <AdminTableCell>
                    <EnrollmentLearningStatusBadge status={student.learningStatus} />
                  </AdminTableCell>
                  <AdminTableCell className="text-[#6B7280]">
                    {student.progressRate}%
                  </AdminTableCell>
                  <AdminTableCell>
                    {student.isCompleted ? (
                      <span className="inline-flex rounded-md bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#059669]">
                        수료
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#9CA3AF]">
                        미수료
                      </span>
                    )}
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        </div>
      ) : (
        <div className="flex min-h-[160px] items-center justify-center text-sm text-[#9CA3AF]">
          등록된 수강생이 없습니다.
        </div>
      )}
    </AdminModal>
  );
}
