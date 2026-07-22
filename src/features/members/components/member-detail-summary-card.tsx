import { MemberDeletedBadge } from "@/features/members/components/member-deleted-badge";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import { M } from "@/features/members/lib/member-design";
import type { MemberDetail } from "@/features/members/types/member-detail.types";
import { formatDate } from "@/lib/shared/format-date";

type MemberDetailSummaryCardProps = {
  member: MemberDetail;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 0" }}>
      <dt style={{ fontSize: 12, color: M.mute, marginBottom: 6 }}>{label}</dt>
      <dd style={{ fontSize: 14, fontWeight: 500, color: M.ink, margin: 0 }}>{value}</dd>
    </div>
  );
}

/**
 * 회원 상세 상단 요약. 화이트 + 헤어라인 톤으로 아바타 + 핵심 필드를 표시합니다.
 */
export function MemberDetailSummaryCard({ member }: MemberDetailSummaryCardProps) {
  const deleted = member.deletedAt !== null;
  const initial = member.name.trim().charAt(0) || "회";

  return (
    <section style={{ borderTop: `1.5px solid ${M.ink}`, paddingTop: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: deleted ? M.mute : M.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 700,
            flex: "none",
          }}
        >
          {initial}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: M.ink }}>{member.name}</span>
          {deleted ? <MemberDeletedBadge /> : <MemberStatusBadge status={member.status} />}
          <span style={{ fontSize: 13, color: M.mute }}>@{member.loginId}</span>
        </div>
      </div>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0 32px",
          borderTop: `1px solid ${M.line}`,
          marginTop: 12,
        }}
      >
        <Field label="이름" value={member.name} />
        <Field label="아이디" value={member.loginId} />
        <Field label="연락처" value={member.phone ?? "—"} />
        <Field label="이메일" value={member.email ?? "—"} />
        <Field label="담당자" value={member.managerName ?? "—"} />
        <Field label="가입일" value={formatDate(member.joinedAt)} />
      </dl>
    </section>
  );
}
