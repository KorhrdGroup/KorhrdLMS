"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminButton,
  adminButtonVariants,
} from "@/components/admin/ui/admin-button";
import {
  AdminCard,
  AdminCardContent,
} from "@/components/admin/ui/admin-card";
import { AdminTabs, type AdminTabItem } from "@/components/admin/ui/admin-tabs";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";
import type { GradeListItem } from "@/features/grades/types/grade.types";
import { MemberDetailSummaryCard } from "@/features/members/components/member-detail-summary-card";
import { MemberEditModal } from "@/features/members/components/member-edit-modal";
import { MemberEnrollmentsPanel } from "@/features/members/components/member-enrollments-panel";
import { MemberGradesPanel } from "@/features/members/components/member-grades-panel";
import type { MemberDetail } from "@/features/members/types/member-detail.types";
import { cn } from "@/lib/utils";

const MEMBER_DETAIL_TABS: AdminTabItem[] = [
  { id: "basic", label: "기본정보" },
  { id: "enrollments", label: "수강정보" },
  { id: "grades", label: "성적정보" },
  { id: "payments", label: "결제내역" },
  { id: "consultations", label: "상담기록" },
  { id: "exams", label: "시험관리" },
  { id: "certificates", label: "자격증" },
  { id: "activity", label: "활동로그" },
];

type MemberDetailViewProps = {
  member: MemberDetail;
  enrollments: EnrollmentRecordListItem[];
  grades: GradeListItem[];
};

function EmptyTabPanel() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
      준비 중입니다.
    </div>
  );
}

export function MemberDetailView({ member, enrollments, grades }: MemberDetailViewProps) {
  const [activeTab, setActiveTab] = useState(MEMBER_DETAIL_TABS[0].id);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="회원 상세"
        description={`${member.name} (${member.loginId}) 회원의 상세 정보를 확인할 수 있습니다.`}
        actions={
          <>
            <Link
              href="/admin/members"
              className={cn(adminButtonVariants({ variant: "outline", size: "sm" }))}
            >
              <ArrowLeft className="size-4" />
              목록으로
            </Link>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
              회원 수정
            </AdminButton>
          </>
        }
      />

      <MemberDetailSummaryCard member={member} />

      <AdminCard>
        <AdminCardContent className="py-0">
          <AdminTabs
            tabs={MEMBER_DETAIL_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {activeTab === "enrollments" ? (
              <MemberEnrollmentsPanel enrollments={enrollments} />
            ) : activeTab === "grades" ? (
              <MemberGradesPanel grades={grades} />
            ) : (
              <EmptyTabPanel />
            )}
          </AdminTabs>
        </AdminCardContent>
      </AdminCard>

      <MemberEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        memberId={member.id}
      />
    </div>
  );
}
