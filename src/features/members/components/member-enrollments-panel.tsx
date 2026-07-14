import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { EnrollmentLearningStatusBadge } from "@/features/enrollments/components/enrollment-learning-status-badge";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";
import { formatDate } from "@/lib/shared/format-date";

type MemberEnrollmentsPanelProps = {
  enrollments: EnrollmentRecordListItem[];
};

export function MemberEnrollmentsPanel({ enrollments }: MemberEnrollmentsPanelProps) {
  if (enrollments.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-sm text-[#9CA3AF]">
        <p>등록된 수강 정보가 없습니다.</p>
        <p className="text-xs">학생이 프론트 수강신청을 완료하면 이곳에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>담당교수</AdminTableHead>
            <AdminTableHead>수강기간</AdminTableHead>
            <AdminTableHead>상태</AdminTableHead>
            <AdminTableHead>진도율</AdminTableHead>
            <AdminTableHead>시험</AdminTableHead>
            <AdminTableHead>과제</AdminTableHead>
            <AdminTableHead>수료여부</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {enrollments.map((enrollment) => (
            <AdminTableRow key={enrollment.id}>
              <AdminTableCell className="font-medium">
                {enrollment.course.name}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {enrollment.instructorName}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatDate(enrollment.start_date)} ~ {formatDate(enrollment.end_date)}
              </AdminTableCell>
              <AdminTableCell>
                <EnrollmentLearningStatusBadge status={enrollment.learningStatus} />
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {enrollment.progressRate}%
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {enrollment.examStatus}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {enrollment.assignmentStatus}
              </AdminTableCell>
              <AdminTableCell>
                {enrollment.isCompleted ? (
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
  );
}
