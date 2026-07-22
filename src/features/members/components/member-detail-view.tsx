"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";

import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";
import type { GradeListItem } from "@/features/grades/types/grade.types";
import { MemberDetailSummaryCard } from "@/features/members/components/member-detail-summary-card";
import { MemberEditModal } from "@/features/members/components/member-edit-modal";
import { MemberEnrollmentsPanel } from "@/features/members/components/member-enrollments-panel";
import { MemberGradesPanel } from "@/features/members/components/member-grades-panel";
import { M } from "@/features/members/lib/member-design";
import type { MemberDetail } from "@/features/members/types/member-detail.types";

const MEMBER_DETAIL_TABS = [
  { id: "basic", label: "기본정보" },
  { id: "enrollments", label: "수강정보" },
  { id: "grades", label: "성적정보" },
  { id: "payments", label: "결제내역" },
  { id: "consultations", label: "상담기록" },
  { id: "exams", label: "시험관리" },
  { id: "certificates", label: "자격증" },
  { id: "activity", label: "활동로그" },
] as const;

type MemberDetailViewProps = {
  member: MemberDetail;
  enrollments: EnrollmentRecordListItem[];
  grades: GradeListItem[];
};

function EmptyTabPanel() {
  return (
    <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
      준비 중입니다.
    </div>
  );
}

export function MemberDetailView({ member, enrollments, grades }: MemberDetailViewProps) {
  const [activeTab, setActiveTab] = useState<(typeof MEMBER_DETAIL_TABS)[number]["id"]>("basic");
  const [editOpen, setEditOpen] = useState(false);

  const outlineBtn: CSSProperties = {
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    border: `1px solid ${M.border}`,
    background: "#fff",
    color: M.text,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };

  return (
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
            <Link href="/admin/members" style={{ color: M.mute }}>
              회원관리
            </Link>
            <span style={{ margin: "0 4px" }}>/</span>
            <Link href="/admin/members" style={{ color: M.mute }}>
              회원목록
            </Link>
            <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>{member.name}</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>회원 상세</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
            {member.name} ({member.loginId}) 회원의 상세 정보를 확인할 수 있습니다.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/admin/members" style={outlineBtn}>
            ← 목록으로
          </Link>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background: M.accent,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            회원 수정
          </button>
        </div>
      </div>

      {/* 요약 */}
      <MemberDetailSummaryCard member={member} />

      {/* 탭 */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${M.line}`, overflowX: "auto" }}>
        {MEMBER_DETAIL_TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: "relative",
                padding: "12px 14px",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                color: active ? M.ink : M.body,
                background: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                borderBottom: active ? `2px solid ${M.accent}` : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 패널 */}
      <div style={{ paddingTop: 20 }}>
        {activeTab === "enrollments" ? (
          <MemberEnrollmentsPanel enrollments={enrollments} />
        ) : activeTab === "grades" ? (
          <MemberGradesPanel grades={grades} />
        ) : (
          <EmptyTabPanel />
        )}
      </div>

      <MemberEditModal open={editOpen} onOpenChange={setEditOpen} memberId={member.id} />
    </div>
  );
}
