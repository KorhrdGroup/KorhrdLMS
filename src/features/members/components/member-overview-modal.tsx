"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { getMemberOverviewAction } from "@/features/members/actions/member-edit.actions";
import { impersonateMemberAction } from "@/features/members/actions/member-impersonate.actions";
import { MemberDeletedBadge } from "@/features/members/components/member-deleted-badge";
import { MemberEnrollmentsPanel } from "@/features/members/components/member-enrollments-panel";
import { MemberGradesPanel } from "@/features/members/components/member-grades-panel";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import { M } from "@/features/members/lib/member-design";
import type { MemberOverview } from "@/features/members/services/member-overview.service";
import { COURSE_PAYMENT_STATUS_LABELS } from "@/features/payments/constants";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import { formatDate, formatDateTime } from "@/lib/shared/format-date";

type MemberOverviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string | null;
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "10px 10px",
  fontSize: 12,
  fontWeight: 500,
  color: M.mute,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${M.line}`,
};
const td: CSSProperties = {
  padding: "11px 10px",
  fontSize: 13,
  color: M.body,
  borderBottom: `1px solid ${M.line}`,
};

const OVERVIEW_TABS = [
  { id: "basic", label: "기본정보" },
  { id: "enrollments", label: "수강정보" },
  { id: "grades", label: "성적정보" },
  { id: "payments", label: "결제내역" },
  { id: "exams", label: "시험관리" },
] as const;

type OverviewTabId = (typeof OVERVIEW_TABS)[number]["id"];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${M.line}` }}>
      <dt style={{ flex: "0 0 130px", padding: "11px 14px", fontSize: 13, color: M.mute, background: "#F9FAFB" }}>
        {label}
      </dt>
      <dd style={{ flex: 1, padding: "11px 14px", fontSize: 13.5, fontWeight: 500, color: M.ink, margin: 0 }}>
        {value}
      </dd>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "26px 0", textAlign: "center", fontSize: 13, color: M.mute, border: `1px dashed ${M.line}`, borderRadius: 10 }}>
      {children}
    </div>
  );
}

/**
 * 회원관리 목록에서 이름 클릭 시 뜨는 팝업 — 기본정보·수강정보·성적정보·
 * 결제내역·시험관리를 상세 페이지로 이동하지 않고 한 장에서 스크롤로 봅니다.
 */
export function MemberOverviewModal({ open, onOpenChange, memberId }: MemberOverviewModalProps) {
  const [overview, setOverview] = useState<MemberOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OverviewTabId>("basic");
  const [impersonating, setImpersonating] = useState(false);

  /** 이 학생의 세션 쿠키를 심고 학생 화면을 새 탭으로 엽니다 (발급신청 대행용) */
  async function handleImpersonate() {
    if (!memberId || impersonating) return;
    setImpersonating(true);
    try {
      const result = await impersonateMemberAction(memberId);
      if (!result.success) {
        setError(result.message);
        return;
      }
      window.open("/", "_blank", "noopener");
    } catch (e) {
      setError(e instanceof Error ? e.message : "대리 로그인에 실패했습니다.");
    } finally {
      setImpersonating(false);
    }
  }

  useEffect(() => {
    if (!open || !memberId) return;
    let alive = true;
    setOverview(null);
    setError(null);
    setActiveTab("basic");
    getMemberOverviewAction(memberId)
      .then((result) => {
        if (!alive) return;
        if (result.success) setOverview(result.overview);
        else setError(result.message);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "불러오지 못했습니다."));
    return () => {
      alive = false;
    };
  }, [open, memberId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const member = overview?.member;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="회원 전체 정보"
      style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={() => onOpenChange(false)}
        style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, .45)" }}
      />
      <div
        style={{
          position: "relative",
          width: "min(1320px, 96vw)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 24px 64px rgba(0,0,0,.24)",
          overflow: "hidden",
        }}
      >
        {/* 머리말 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: `1px solid ${M.line}` }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: M.ink }}>
            {member ? `${member.name} (${member.loginId})` : "회원 정보"}
          </div>
          {member ? (
            member.deletedAt !== null ? <MemberDeletedBadge /> : <MemberStatusBadge status={member.status} />
          ) : null}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {member && member.deletedAt === null ? (
              <button
                type="button"
                onClick={handleImpersonate}
                disabled={impersonating}
                title="이 학생의 세션으로 학생 화면을 새 탭에서 엽니다 — 발급신청 등을 대신 처리할 때 씁니다"
                style={{
                  padding: "7px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                  border: "none", background: impersonating ? "#9dc4fb" : "#3182F6",
                  color: "#fff", cursor: impersonating ? "default" : "pointer",
                }}
              >
                {impersonating ? "여는 중…" : "학생으로 로그인"}
              </button>
            ) : null}
            {memberId ? (
              <Link
                href={`/admin/members/${memberId}`}
                style={{
                  padding: "7px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                  border: `1px solid ${M.border}`, color: M.text, textDecoration: "none",
                }}
              >
                전체 화면으로
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="닫기"
              style={{ display: "inline-flex", padding: 7, borderRadius: 8, border: "none", background: M.hover, cursor: "pointer", color: M.body }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* 탭 — 상세 페이지와 같은 다섯 갈래 */}
        <div style={{ display: "flex", gap: 4, padding: "0 20px", borderBottom: `1px solid ${M.line}`, overflowX: "auto", flexShrink: 0 }}>
          {OVERVIEW_TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 14px",
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 500,
                  color: active ? M.ink : M.body,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  borderBottom: active ? "2px solid #3182F6" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 본문 — 선택한 탭만 보여주고 안에서 스크롤 */}
        <div style={{ overflowY: "auto", padding: "18px 20px 28px", minHeight: 340 }}>
          {error ? (
            <div style={{ margin: "20px 0", borderRadius: 8, background: "#fdecee", color: M.danger, padding: "12px 14px", fontSize: 13 }}>
              {error}
            </div>
          ) : !overview || !member ? (
            <div style={{ padding: "60px 0", textAlign: "center", fontSize: 13, color: M.mute }}>
              불러오는 중…
            </div>
          ) : activeTab === "basic" ? (
              <dl style={{ margin: 0, border: `1px solid ${M.line}`, borderBottom: "none", borderRadius: 10, overflow: "hidden" }}>
                <InfoRow label="이름" value={member.name} />
                <InfoRow label="아이디" value={member.loginId} />
                <InfoRow label="이메일" value={member.email ?? "—"} />
                <InfoRow label="연락처" value={member.phone ?? "—"} />
                <InfoRow label="담당자" value={member.managerName ?? "—"} />
                <InfoRow label="가입일" value={formatDate(member.joinedAt)} />
              </dl>
          ) : activeTab === "enrollments" ? (
              <MemberEnrollmentsPanel
                memberId={member.id}
                enrollments={overview.enrollments}
                courseOptions={overview.courseOptions}
              />
          ) : activeTab === "grades" ? (
              <MemberGradesPanel grades={overview.grades} />
          ) : activeTab === "payments" ? (
              overview.payments.length === 0 ? (
                <EmptyNote>결제 내역이 없습니다.</EmptyNote>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th style={th}>결제일</th>
                        <th style={th}>과정명</th>
                        <th style={{ ...th, textAlign: "right" }}>금액</th>
                        <th style={{ ...th, textAlign: "center" }}>결제방법</th>
                        <th style={{ ...th, textAlign: "center" }}>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>{formatDate(payment.paymentDate)}</td>
                          <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{payment.courseName}</td>
                          <td style={{ ...td, textAlign: "right" }}>{payment.amount.toLocaleString("ko-KR")}원</td>
                          <td style={{ ...td, textAlign: "center" }}>{getPaymentMethodLabel(payment.paymentMethod)}</td>
                          <td style={{ ...td, textAlign: "center" }}>{COURSE_PAYMENT_STATUS_LABELS[payment.status]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          ) : (
              overview.exams.length === 0 ? (
                <EmptyNote>시험 응시 내역이 없습니다.</EmptyNote>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th style={th}>응시일시</th>
                        <th style={th}>과정명</th>
                        <th style={th}>시험명</th>
                        <th style={{ ...th, textAlign: "center" }}>점수</th>
                        <th style={{ ...th, textAlign: "center" }}>합격여부</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.exams.map((exam) => (
                        <tr key={exam.id}>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>{formatDateTime(exam.submittedAt)}</td>
                          <td style={td}>{exam.courseName}</td>
                          <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{exam.examName}</td>
                          <td style={{ ...td, textAlign: "center" }}>
                            {exam.score} / {exam.totalScore}
                          </td>
                          <td style={{ ...td, textAlign: "center" }}>
                            {exam.isPassed === null ? "—" : exam.isPassed ? (
                              <span style={{ color: "#12b76a", fontWeight: 700 }}>합격</span>
                            ) : (
                              <span style={{ color: M.danger, fontWeight: 700 }}>불합격</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
