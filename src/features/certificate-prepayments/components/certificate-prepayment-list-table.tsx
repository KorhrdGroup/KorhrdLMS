"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import { formatCertificateAmount, formatOptionalText } from "@/features/certificates/lib/certificate.utils";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import { M } from "@/features/courses/lib/course-design";
import type { CertificatePrepaymentListItem } from "@/features/certificate-prepayments/types/certificate-prepayment.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CertificatePrepaymentListTableProps = {
  result: PaginatedResult<CertificatePrepaymentListItem>;
  onEditClick?: (item: CertificatePrepaymentListItem) => void;
  onDeleteClick?: (item: CertificatePrepaymentListItem) => void;
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "11px 10px",
  fontSize: 12,
  fontWeight: 500,
  color: M.mute,
  whiteSpace: "nowrap",
};
const td: CSSProperties = {
  padding: "13px 10px",
  fontSize: 13,
  color: M.body,
  verticalAlign: "middle",
};

const iconBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 600,
  background: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function UsageCell({ item }: { item: CertificatePrepaymentListItem }) {
  if (!item.usedAt) {
    return <span style={{ fontSize: 12, color: M.mute }}>미사용</span>;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 600,
        background: M.weakBg,
        color: M.weakFg,
      }}
    >
      사용완료
    </span>
  );
}

function LinkedApplicationCell({ item }: { item: CertificatePrepaymentListItem }) {
  if (!item.linkedApplication) {
    return <span style={{ fontSize: 12, color: M.mute }}>—</span>;
  }

  return (
    <span style={{ fontSize: 12, color: M.body }}>
      {item.linkedApplication.certificateName}
      <br />
      <span style={{ color: M.mute }}>{formatDate(item.linkedApplication.appliedAt)} 신청</span>
    </span>
  );
}

export function CertificatePrepaymentListTable({
  result,
  onEditClick,
  onDeleteClick,
}: CertificatePrepaymentListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 선납결제 내역이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1320 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, textAlign: "center", width: 56 }}>번호</th>
            <th style={th}>학생명</th>
            <th style={{ ...th, width: 112 }}>아이디</th>
            <th style={{ ...th, width: 128 }}>연락처</th>
            <th style={th}>선납 과정/자격증명</th>
            <th style={{ ...th, textAlign: "right", width: 112 }}>선납금액</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>결제방법</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>결제상태</th>
            <th style={{ ...th, textAlign: "center", width: 112 }}>선납일</th>
            <th style={{ ...th, textAlign: "center", width: 80 }}>사용여부</th>
            <th style={{ ...th, minWidth: 180 }}>연결된 발급신청</th>
            <th style={{ ...th, minWidth: 140 }}>메모</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>수정</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((item, index) => {
            const rowNumber = result.total - ((result.page - 1) * result.pageSize + index);
            const used = Boolean(item.usedAt);

            return (
              <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{rowNumber}</td>
                <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{item.memberName}</td>
                <td style={{ ...td, color: M.mute }}>{item.memberLoginId}</td>
                <td style={{ ...td, color: M.mute }}>{formatOptionalText(item.memberPhone)}</td>
                <td style={td}>
                  {item.certificateName}
                  {item.courseName ? (
                    <span style={{ marginLeft: 4, fontSize: 12, color: M.mute }}>({item.courseName})</span>
                  ) : null}
                </td>
                <td style={{ ...td, textAlign: "right", color: M.ink, fontWeight: 600 }}>
                  {formatCertificateAmount(item.amount)}
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>
                  {item.paymentMethod ? getPaymentMethodLabel(item.paymentMethod) : "—"}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <PaymentStatusBadge status={item.paymentStatus} />
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>
                  {item.paidAt ? formatDate(item.paidAt) : "—"}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <UsageCell item={item} />
                </td>
                <td style={td}>
                  <LinkedApplicationCell item={item} />
                </td>
                <td style={{ ...td, color: M.mute }}>{formatOptionalText(item.memo)}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    disabled={used}
                    onClick={() => onEditClick?.(item)}
                    style={{ ...iconBtn, margin: "0 auto", border: `1px solid ${M.border}`, color: M.text, opacity: used ? 0.4 : 1, cursor: used ? "not-allowed" : "pointer" }}
                  >
                    <Pencil style={{ width: 14, height: 14 }} />
                    수정
                  </button>
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    disabled={used}
                    onClick={() => onDeleteClick?.(item)}
                    style={{ ...iconBtn, margin: "0 auto", border: "1px solid #f4c9cd", color: M.danger, opacity: used ? 0.4 : 1, cursor: used ? "not-allowed" : "pointer" }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                    삭제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
