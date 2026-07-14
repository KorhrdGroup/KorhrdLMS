import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/admin-card";
import { MemberDeletedBadge } from "@/features/members/components/member-deleted-badge";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import type { MemberDetail } from "@/features/members/types/member-detail.types";
import { formatDate } from "@/lib/shared/format-date";

type MemberDetailSummaryCardProps = {
  member: MemberDetail;
};

type SummaryFieldProps = {
  label: string;
  value: React.ReactNode;
};

function SummaryField({ label, value }: SummaryFieldProps) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

export function MemberDetailSummaryCard({ member }: MemberDetailSummaryCardProps) {
  const deleted = member.deletedAt !== null;

  return (
    <AdminCard>
      <AdminCardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <AdminCardTitle>{member.name}</AdminCardTitle>
          {deleted ? <MemberDeletedBadge /> : <MemberStatusBadge status={member.status} />}
        </div>
      </AdminCardHeader>
      <AdminCardContent>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryField label="이름" value={member.name} />
          <SummaryField label="아이디" value={member.loginId} />
          <SummaryField label="연락처" value={member.phone ?? "—"} />
          <SummaryField label="이메일" value={member.email ?? "—"} />
          <SummaryField
            label="상태"
            value={
              deleted ? (
                <MemberDeletedBadge />
              ) : (
                <MemberStatusBadge status={member.status} />
              )
            }
          />
          <SummaryField label="담당자" value={member.managerName ?? "—"} />
          <SummaryField label="가입일" value={formatDate(member.joinedAt)} />
        </dl>
      </AdminCardContent>
    </AdminCard>
  );
}
