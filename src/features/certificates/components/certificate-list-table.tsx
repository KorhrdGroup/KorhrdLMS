"use client";

import type { CSSProperties } from "react";
import { Eye, Trash2 } from "lucide-react";

import {
  formatApplicantWithId,
  formatCertificateAmount,
  formatFullAddress,
  formatOptionalText,
} from "@/features/certificates/lib/certificate.utils";
import { M } from "@/features/courses/lib/course-design";
import type { CertificateListItem } from "@/features/certificates/types/certificate.types";
import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CertificateListTableProps = {
  result: PaginatedResult<CertificateListItem>;
  onDetailClick?: (item: CertificateListItem) => void;
  onDeleteClick?: (item: CertificateListItem) => void;
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

function CertificatePhotoCell({ item }: { item: CertificateListItem }) {
  if (!item.photoUrl) {
    return <span style={{ fontSize: 12, color: M.mute }}>사진 없음</span>;
  }

  return (
    <a
      href={item.photoUrl}
      target="_blank"
      rel="noreferrer"
      title="사진 크게 보기"
      style={{
        display: "inline-flex",
        height: 48,
        width: 40,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 6,
        border: `1px solid ${M.border}`,
        background: M.hover,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.photoUrl}
        alt={`${item.applicantName} 증명사진`}
        style={{ height: "100%", width: "100%", objectFit: "cover" }}
      />
    </a>
  );
}

export function CertificateListTable({
  result,
  onDetailClick,
  onDeleteClick,
}: CertificateListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        조회된 자격증 신청 내역이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1280 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, textAlign: "center", width: 56 }}>번호</th>
            <th style={th}>자격증명</th>
            <th style={th}>신청자</th>
            <th style={{ ...th, width: 128 }}>연락처</th>
            <th style={{ ...th, minWidth: 220 }}>배송정보</th>
            <th style={{ ...th, textAlign: "center", width: 56 }}>사진</th>
            <th style={{ ...th, textAlign: "right", width: 112 }}>발급비용</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>결제방법</th>
            <th style={{ ...th, textAlign: "center", width: 130 }}>결제상태</th>
            <th style={{ ...th, textAlign: "center", width: 112 }}>신청일</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>신청내역</th>
            <th style={{ ...th, textAlign: "center", width: 88 }}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((item, index) => {
            const rowNumber = result.total - ((result.page - 1) * result.pageSize + index);

            return (
              <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{rowNumber}</td>
                <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{item.certificateName}</td>
                <td style={td}>{formatApplicantWithId(item.applicantName, item.memberLoginId)}</td>
                <td style={{ ...td, color: M.mute }}>{formatOptionalText(item.phone)}</td>
                <td style={{ ...td, color: M.mute }}>
                  {formatFullAddress(item.postalCode, item.address, item.addressDetail)}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <CertificatePhotoCell item={item} />
                </td>
                <td style={{ ...td, textAlign: "right", color: M.ink, fontWeight: 600 }}>
                  {formatCertificateAmount(item.issuanceCost)}
                </td>
                {/* 결제방법 — 값이 없으면 무통장입금 안내 상태입니다 */}
                <td style={{ ...td, textAlign: "center" }}>
                  {item.paymentMethod ? getPaymentMethodLabel(item.paymentMethod) : "무통장"}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <PaymentStatusBadge status={item.paymentStatus} />
                  {/* 입금이 끝났으면 다음 단계(협회 전달)를 바로 보여줍니다 */}
                  {item.paymentStatus === "paid" || item.paymentStatus === "prepaid" ? (
                    <div style={{ marginTop: 4, fontSize: 11, color: M.mute }}>
                      매주 화요일 협회 전달
                    </div>
                  ) : null}
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{formatDate(item.appliedAt)}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onDetailClick?.(item)}
                    style={{ ...iconBtn, margin: "0 auto", border: `1px solid ${M.border}`, color: M.text }}
                  >
                    <Eye style={{ width: 14, height: 14 }} />
                    보기
                  </button>
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onDeleteClick?.(item)}
                    style={{ ...iconBtn, margin: "0 auto", border: "1px solid #f4c9cd", color: M.danger }}
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
