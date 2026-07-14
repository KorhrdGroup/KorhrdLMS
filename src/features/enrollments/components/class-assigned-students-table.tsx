import { EnrollmentStatusBadge } from "@/features/enrollments/components/enrollment-status-badge";
import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import type { ClassAssignedStudent } from "@/features/enrollments/types/class-detail.types";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";

type ClassAssignedStudentsTableProps = {
  students: ClassAssignedStudent[];
};

export function ClassAssignedStudentsTable({
  students,
}: ClassAssignedStudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#9CA3AF]">
        배정된 수강생이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>이름</AdminTableHead>
            <AdminTableHead>아이디</AdminTableHead>
            <AdminTableHead>상태</AdminTableHead>
            <AdminTableHead>결제상태</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {students.map((student) => (
            <AdminTableRow key={student.id}>
              <AdminTableCell className="font-medium">{student.memberName}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">{student.loginId}</AdminTableCell>
              <AdminTableCell>
                <EnrollmentStatusBadge status={student.status} />
              </AdminTableCell>
              <AdminTableCell>
                <PaymentStatusBadge status={student.paymentStatus} />
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
