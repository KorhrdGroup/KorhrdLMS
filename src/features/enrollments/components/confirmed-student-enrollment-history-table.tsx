import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import type { ConfirmedStudentEnrollmentHistoryItem } from "@/features/enrollments/types/confirmed-student.types";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { formatDate } from "@/lib/shared/format-date";
import { cn } from "@/lib/utils";

type ConfirmedStudentEnrollmentHistoryTableProps = {
  history: ConfirmedStudentEnrollmentHistoryItem[];
  currentEnrollmentId?: string;
};

function formatPeriod(startDate: string, endDate: string) {
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
}

function PlaceholderCell() {
  return <span className="text-[#9CA3AF]">—</span>;
}

export function ConfirmedStudentEnrollmentHistoryTable({
  history,
  currentEnrollmentId,
}: ConfirmedStudentEnrollmentHistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#9CA3AF]">
        수강 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>수강기간</AdminTableHead>
            <AdminTableHead>출석률</AdminTableHead>
            <AdminTableHead>시험</AdminTableHead>
            <AdminTableHead>과제</AdminTableHead>
            <AdminTableHead>수료여부</AdminTableHead>
            <AdminTableHead>결제상태</AdminTableHead>
            <AdminTableHead>자격증</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {history.map((item) => {
            const isCurrent = item.id === currentEnrollmentId;

            return (
              <AdminTableRow
                key={item.id}
                className={cn(isCurrent && "bg-[#EFF6FF]")}
              >
                <AdminTableCell className={cn("font-medium", isCurrent && "text-[#3B82F6]")}>
                  {item.courseName}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatPeriod(item.startDate, item.endDate)}
                </AdminTableCell>
                <AdminTableCell>
                  <PlaceholderCell />
                </AdminTableCell>
                <AdminTableCell>
                  <PlaceholderCell />
                </AdminTableCell>
                <AdminTableCell>
                  <PlaceholderCell />
                </AdminTableCell>
                <AdminTableCell>
                  <PlaceholderCell />
                </AdminTableCell>
                <AdminTableCell>
                  <PaymentStatusBadge status={item.paymentStatus} />
                </AdminTableCell>
                <AdminTableCell>
                  <PlaceholderCell />
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
