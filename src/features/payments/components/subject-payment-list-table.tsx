"use client";

import { Eye } from "lucide-react";
import type { CSSProperties } from "react";

import { CoursePaymentStatusBadge } from "@/features/payments/components/course-payment-status-badge";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import {
  formatCouponApplied,
  formatMemberNameWithId,
  formatOptionalText,
  formatPaymentAmount,
} from "@/features/payments/lib/subject-payment.utils";
import { M } from "@/features/courses/lib/course-design";
import type { SubjectPaymentListItem } from "@/features/payments/types/subject-payment.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type SubjectPaymentListTableProps = {
  result: PaginatedResult<SubjectPaymentListItem>;
  onDetailClick?: (item: SubjectPaymentListItem) => void;
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
  whiteSpace: "nowrap",
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
  border: `1px solid ${M.border}`,
  color: M.text,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function SubjectPaymentListTable({
  result,
  onDetailClick,
}: SubjectPaymentListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        조회된 결제 내역이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1180 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={th}>결제일</th>
            <th style={th}>성명(ID)</th>
            <th style={th}>쿠폰번호</th>
            <th style={th}>신청과목</th>
            <th style={th}>PG 주문번호</th>
            <th style={th}>할당강사</th>
            <th style={{ ...th, textAlign: "right" }}>결제금액</th>
            <th style={th}>결제방법</th>
            <th style={{ ...th, textAlign: "center" }}>쿠폰적용</th>
            <th style={{ ...th, textAlign: "center" }}>상태</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>상세보기</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((item) => (
            <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
              <td style={{ ...td, color: M.mute }}>{formatDate(item.paymentDate)}</td>
              <td style={{ ...td, color: M.ink, fontWeight: 600 }}>
                {formatMemberNameWithId(item.memberName, item.memberLoginId)}
              </td>
              <td style={{ ...td, color: M.mute }}>{formatOptionalText(item.couponNumber)}</td>
              <td style={td}>{item.courseName}</td>
              <td style={{ ...td, color: M.mute }}>{formatOptionalText(item.pgOrderId)}</td>
              <td style={{ ...td, color: M.mute }}>{formatOptionalText(item.assignedInstructor)}</td>
              <td style={{ ...td, textAlign: "right", color: M.ink, fontWeight: 600 }}>
                {formatPaymentAmount(item.amount)}
              </td>
              <td style={{ ...td, color: M.mute }}>{getPaymentMethodLabel(item.paymentMethod)}</td>
              <td style={{ ...td, textAlign: "center", color: M.mute }}>
                {formatCouponApplied(item.couponApplied)}
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <CoursePaymentStatusBadge status={item.status} />
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => onDetailClick?.(item)}
                  style={{ ...iconBtn, margin: "0 auto" }}
                >
                  <Eye style={{ width: 14, height: 14 }} />
                  보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
