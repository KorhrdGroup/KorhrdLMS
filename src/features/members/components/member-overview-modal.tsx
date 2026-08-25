"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";

import { updateCertificateApplicationAction } from "@/features/certificates/actions/certificate.actions";
import { getMemberOverviewAction } from "@/features/members/actions/member-edit.actions";
import { impersonateMemberAction } from "@/features/members/actions/member-impersonate.actions";
import {
  addManualBankTransferAction,
  deletePaymentRecordAction,
} from "@/features/members/actions/member-payment.actions";
import { MemberDeletedBadge } from "@/features/members/components/member-deleted-badge";
import { MemberEnrollmentsPanel } from "@/features/members/components/member-enrollments-panel";
import { MemberGradesPanel } from "@/features/members/components/member-grades-panel";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import { M } from "@/features/members/lib/member-design";
import type { MemberOverview } from "@/features/members/services/member-overview.service";
import { COURSE_PAYMENT_STATUS_LABELS } from "@/features/payments/constants";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import { formatDate, formatDateTime } from "@/lib/shared/format-date";
import { ALIMTALK_TEMPLATE_LABELS, type AlimtalkTemplateKey } from "@/lib/aligo/templates";
import { todayInKst } from "@/lib/shared/kst-date";

type MemberOverviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string | null;
};

const OVERVIEW_TABS = [
  { id: "info", label: "회원정보" },
  { id: "payments", label: "결제내역" },
  { id: "alimtalk", label: "알림톡 이력" },
] as const;

/** 발송 이력 출처 한글 라벨 (운영관리 이력 화면과 동일) */
const TRIGGER_LABELS: Record<string, string> = {
  auto_signup: "가입 자동",
  auto_enrollment: "수강신청 자동",
  auto_over60: "60% 도달 자동",
  cron_under60: "주간 독려",
  admin_bulk: "일괄 발송",
  admin_test: "테스트",
};

type OverviewTabId = (typeof OVERVIEW_TABS)[number]["id"];

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 15, fontWeight: 700, color: M.ink, margin: "26px 0 12px" }}>
      {children}
    </h3>
  );
}

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
 * 회원관리 목록에서 이름/행 클릭 시 뜨는 팝업.
 * [회원정보] 탭 — 기본·수강·성적·시험을 한 장에서 스크롤로,
 * [결제내역] 탭 — 자격증 신청 결제상태(계좌이체 대기 포함)와 결제 기록,
 *                수기 계좌이체 추가까지 여기서 처리합니다.
 */
export function MemberOverviewModal({ open, onOpenChange, memberId }: MemberOverviewModalProps) {
  const [overview, setOverview] = useState<MemberOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OverviewTabId>("info");
  const [impersonating, setImpersonating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /* 수기 계좌이체 입력 */
  const [manualCourseId, setManualCourseId] = useState("");
  const [manualAmount, setManualAmount] = useState("100000");
  const [manualDate, setManualDate] = useState("");
  const [manualSaving, setManualSaving] = useState(false);

  async function reload() {
    if (!memberId) return;
    const result = await getMemberOverviewAction(memberId);
    if (result.success) setOverview(result.overview);
    else setError(result.message);
  }

  useEffect(() => {
    if (!open || !memberId) return;
    let alive = true;
    setOverview(null);
    setError(null);
    setNotice(null);
    setActiveTab("info");
    setManualCourseId("");
    setManualAmount("100000");
    setManualDate(todayInKst());
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

  /** 자격증 신청 결제상태 토글 — 입금완료 처리하면 결제 기록에도 자동 반영됩니다 */
  async function handleToggleCertPaid(certId: string, paid: boolean, name: string) {
    setNotice(null);
    try {
      const result = await updateCertificateApplicationAction(certId, {
        paymentStatus: paid ? "paid" : "unpaid",
      });
      if (!result.success) {
        setNotice(result.message);
        return;
      }
      setNotice(`${name} — ${paid ? "입금완료 처리했습니다." : "대기중으로 되돌렸습니다."}`);
      await reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "처리에 실패했습니다.");
    }
  }

  /** 결제 기록 삭제 — 잘못 추가한 건 정리 */
  async function handleDeletePayment(paymentId: string, label: string) {
    if (!window.confirm(`"${label}" 결제 기록을 삭제할까요?`)) return;
    setNotice(null);
    try {
      const result = await deletePaymentRecordAction(paymentId);
      setNotice(result.message);
      if (result.success) await reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    }
  }

  /** 수기 계좌이체 추가 — 결제 기록(course_payments)에 결제완료로 넣습니다 */
  async function handleManualAdd() {
    if (!memberId || manualSaving) return;
    const amount = Number(manualAmount.replaceAll(",", ""));
    if (!manualCourseId) {
      setNotice("과정을 선택해주세요.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice("금액을 확인해주세요.");
      return;
    }
    setManualSaving(true);
    setNotice(null);
    try {
      const result = await addManualBankTransferAction({
        memberId,
        courseId: manualCourseId,
        amount,
        paymentDate: manualDate,
      });
      setNotice(result.message);
      if (result.success) await reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "추가에 실패했습니다.");
    } finally {
      setManualSaving(false);
    }
  }

  const inputStyle: CSSProperties = {
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${M.border}`,
    fontSize: 13.5,
    background: "#fff",
  };

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
          height: "min(760px, 88vh)",
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

        {/* 탭 — 회원정보(통합) / 결제내역 */}
        <div style={{ display: "flex", gap: 4, padding: "0 20px", borderBottom: `1px solid ${M.line}`, flexShrink: 0 }}>
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

        <div style={{ overflowY: "auto", padding: "4px 20px 28px", minHeight: 340 }}>
          {notice ? (
            <div style={{ margin: "14px 0 0", borderRadius: 8, background: M.hover, color: M.body, padding: "10px 14px", fontSize: 13 }}>
              {notice}
            </div>
          ) : null}
          {error ? (
            <div style={{ margin: "20px 0", borderRadius: 8, background: "#fdecee", color: M.danger, padding: "12px 14px", fontSize: 13 }}>
              {error}
            </div>
          ) : !overview || !member ? (
            <div style={{ padding: "60px 0", textAlign: "center", fontSize: 13, color: M.mute }}>
              불러오는 중…
            </div>
          ) : activeTab === "info" ? (
            <>
              <SectionTitle>기본정보</SectionTitle>
              <dl style={{ margin: 0, border: `1px solid ${M.line}`, borderBottom: "none", borderRadius: 10, overflow: "hidden" }}>
                <InfoRow label="이름" value={member.name} />
                <InfoRow label="아이디" value={member.loginId} />
                <InfoRow label="이메일" value={member.email ?? "—"} />
                <InfoRow label="연락처" value={member.phone ?? "—"} />
                <InfoRow label="담당자" value={member.managerName ?? "—"} />
                <InfoRow label="가입일" value={formatDate(member.joinedAt)} />
              </dl>

              <SectionTitle>수강정보</SectionTitle>
              <MemberEnrollmentsPanel
                memberId={member.id}
                enrollments={overview.enrollments}
                courseOptions={overview.courseOptions}
              />

              <SectionTitle>성적정보</SectionTitle>
              <MemberGradesPanel grades={overview.grades} />

              <SectionTitle>시험관리</SectionTitle>
              {overview.exams.length === 0 ? (
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
              )}
            </>
          ) : activeTab === "payments" ? (
            <>
              <SectionTitle>자격증 발급신청 결제상태</SectionTitle>
              {overview.certPayments.length === 0 ? (
                <EmptyNote>자격증 발급신청이 없습니다.</EmptyNote>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th style={th}>신청일</th>
                        <th style={th}>자격증명</th>
                        <th style={{ ...th, textAlign: "right" }}>금액</th>
                        <th style={{ ...th, textAlign: "center" }}>결제방법</th>
                        <th style={{ ...th, textAlign: "center" }}>결제상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.certPayments.map((cert) => {
                        const unpaidToggle =
                          cert.paymentStatus === "unpaid" || cert.paymentStatus === "paid";
                        return (
                          <tr
                            key={cert.id}
                            style={{ background: cert.paymentStatus === "unpaid" ? "#FFE9EF" : undefined }}
                          >
                            <td style={{ ...td, whiteSpace: "nowrap" }}>{formatDate(cert.appliedAt)}</td>
                            <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{cert.certificateName}</td>
                            <td style={{ ...td, textAlign: "right" }}>{cert.amount.toLocaleString("ko-KR")}원</td>
                            <td style={{ ...td, textAlign: "center" }}>
                              {cert.paymentMethod ? getPaymentMethodLabel(cert.paymentMethod) : "무통장"}
                            </td>
                            <td style={{ ...td, textAlign: "center" }}>
                              {unpaidToggle ? (
                                <label style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", whiteSpace: "nowrap" }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: cert.paymentStatus === "paid" ? "#3182F6" : M.danger }}>
                                    {cert.paymentStatus === "paid" ? "입금완료" : "대기중"}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={cert.paymentStatus === "paid"}
                                    onChange={(event) =>
                                      handleToggleCertPaid(cert.id, event.target.checked, cert.certificateName)
                                    }
                                    style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#3182F6" }}
                                  />
                                </label>
                              ) : (
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{cert.paymentStatus}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p style={{ fontSize: 12.5, color: M.mute, marginTop: 8 }}>
                계좌이체(무통장) 입금을 확인했으면 체크로 <b>입금완료</b> 처리하세요 — 아래 결제 기록에도 자동으로 남습니다.
              </p>

              <SectionTitle>결제 기록</SectionTitle>
              {overview.payments.length === 0 ? (
                <EmptyNote>결제 기록이 없습니다.</EmptyNote>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th style={th}>결제일</th>
                        <th style={th}>내역</th>
                        <th style={{ ...th, textAlign: "right" }}>금액</th>
                        <th style={{ ...th, textAlign: "center" }}>결제방법</th>
                        <th style={{ ...th, textAlign: "center" }}>상태</th>
                        <th style={{ ...th, textAlign: "center", width: 56 }}>삭제</th>
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
                          <td style={{ ...td, textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleDeletePayment(payment.id, payment.courseName)}
                              title="이 결제 기록을 삭제합니다"
                              style={{
                                display: "inline-flex", padding: 6, borderRadius: 7,
                                border: "1px solid #f4c9cd", background: "#fff",
                                color: M.danger, cursor: "pointer",
                              }}
                            >
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <SectionTitle>계좌이체 수기 추가</SectionTitle>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <select
                  value={manualCourseId}
                  onChange={(e) => setManualCourseId(e.target.value)}
                  style={{ ...inputStyle, minWidth: 240, cursor: "pointer" }}
                >
                  <option value="">과정 선택</option>
                  {overview.courseOptions.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
                <input
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="금액"
                  inputMode="numeric"
                  style={{ ...inputStyle, width: 120 }}
                />
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={handleManualAdd}
                  disabled={manualSaving}
                  style={{
                    padding: "9px 16px", borderRadius: 8, border: "none", fontSize: 13.5, fontWeight: 700,
                    background: manualSaving ? "#9dc4fb" : "#3182F6", color: "#fff",
                    cursor: manualSaving ? "default" : "pointer",
                  }}
                >
                  {manualSaving ? "추가 중…" : "계좌이체 추가"}
                </button>
              </div>
              <p style={{ fontSize: 12.5, color: M.mute, marginTop: 8 }}>
                발급신청 없이 입금만 들어온 경우 등, 결제 기록을 직접 남길 때 씁니다 (계좌이체 · 결제완료로 기록).
              </p>
            </>
          ) : (
            <>
              <SectionTitle>알림톡 발송 이력</SectionTitle>
              {overview.alimtalkLogs.length === 0 ? (
                <EmptyNote>이 회원에게 발송된 알림톡이 없습니다.</EmptyNote>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th style={th}>발송일시</th>
                        <th style={th}>템플릿</th>
                        <th style={th}>출처</th>
                        <th style={{ ...th, textAlign: "center" }}>결과</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.alimtalkLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>{formatDateTime(log.createdAt)}</td>
                          <td style={{ ...td, color: M.ink, fontWeight: 600 }}>
                            {ALIMTALK_TEMPLATE_LABELS[log.templateKey as AlimtalkTemplateKey] ?? log.templateKey}
                          </td>
                          <td style={{ ...td, color: M.mute }}>{TRIGGER_LABELS[log.triggerSource] ?? log.triggerSource}</td>
                          <td style={{ ...td, textAlign: "center", whiteSpace: "nowrap" }}>
                            {log.success ? (
                              <span style={{ color: "#12b76a", fontWeight: 700 }}>성공</span>
                            ) : (
                              <span style={{ color: M.danger, fontWeight: 700 }} title={log.failReason ?? undefined}>
                                실패
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
