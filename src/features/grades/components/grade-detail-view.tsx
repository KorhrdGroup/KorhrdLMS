"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { AdminButton, adminButtonVariants } from "@/components/admin/ui/admin-button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/admin-card";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { updateGradeAttendanceAction } from "@/features/grades/actions/grade.actions";
import { GradeCompletionBadge } from "@/features/grades/components/grade-completion-badge";
import { GradeLetterBadge } from "@/features/grades/components/grade-letter-badge";
import { GradePassBadge } from "@/features/grades/components/grade-pass-badge";
import type { GradeDetail } from "@/features/grades/types/grade.types";
import { formatDate } from "@/lib/shared/format-date";
import { cn } from "@/lib/utils";

type GradeDetailViewProps = {
  detail: GradeDetail;
};

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[#9CA3AF]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#111827]">{value}</p>
    </div>
  );
}

export function GradeDetailView({ detail: initialDetail }: GradeDetailViewProps) {
  const router = useRouter();
  const [detail, setDetail] = useState(initialDetail);
  const [attendanceInput, setAttendanceInput] = useState(String(initialDetail.attendanceRate));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const attendanceRate = Number(attendanceInput);

    startSubmit(async () => {
      try {
        const result = await updateGradeAttendanceAction(detail.enrollmentId, {
          attendanceRate,
        });

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        setDetail(result.detail);
        setAttendanceInput(String(result.detail.attendanceRate));
        setSuccessMessage("출석점수를 수정했습니다. 총점·등급·합격여부가 자동으로 반영되었습니다.");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "출석점수 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="성적 상세"
        description={`${detail.member.name} (${detail.member.loginId}) 회원의 ${detail.course.name} 과정 성적입니다.`}
        actions={
          <Link
            href="/admin/grades"
            className={cn(adminButtonVariants({ variant: "outline" }))}
          >
            목록으로
          </Link>
        }
      />

      <AdminCard>
        <AdminCardHeader className="border-0 pb-0">
          <AdminCardTitle className="text-base">기본 정보</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="grid gap-4 pt-3 sm:grid-cols-4">
          <InfoField label="회원명" value={`${detail.member.name} (${detail.member.loginId})`} />
          <InfoField label="과정명" value={detail.course.name} />
          <InfoField label="담당교수" value={detail.instructorName} />
          <InfoField
            label="수강기간"
            value={`${formatDate(detail.startDate)} ~ ${formatDate(detail.endDate)}`}
          />
        </AdminCardContent>
      </AdminCard>

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHeader className="border-0 pb-0">
            <AdminCardTitle className="text-base">출석점수 수정</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="pt-3">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMessage ? (
                <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
                  {errorMessage}
                </p>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="attendanceRate" className="block text-sm font-medium text-[#374151]">
                  출석점수 (0~100)
                </label>
                <AdminInput
                  id="attendanceRate"
                  type="number"
                  min={0}
                  max={100}
                  variant="outline"
                  value={attendanceInput}
                  onChange={(event) => setAttendanceInput(event.target.value)}
                />
                <p className="text-xs text-[#6B7280]">
                  출석점수를 수정하면 총점·등급·합격여부가 자동으로 다시 계산됩니다.
                </p>
              </div>

              <AdminButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "저장"}
              </AdminButton>
            </form>
          </AdminCardContent>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader className="border-0 pb-0">
            <AdminCardTitle className="text-base">시험 · 과제 점수 확인</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="space-y-4 pt-3">
            <InfoField
              label="시험점수"
              value={detail.examPercent != null ? `${detail.examPercent}점` : "미응시"}
            />
            <InfoField
              label="과제점수"
              value={detail.assignmentScore != null ? `${detail.assignmentScore}점` : "미제출"}
            />
            <p className="text-xs text-[#9CA3AF]">
              시험점수·과제점수는 시험관리·과제관리 데이터를 기준으로 하며 이 화면에서는
              확인만 가능합니다.
            </p>
          </AdminCardContent>
        </AdminCard>
      </div>

      <AdminCard>
        <AdminCardHeader className="border-0 pb-0">
          <AdminCardTitle className="text-base">자동 계산 결과</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="grid gap-6 pt-3 sm:grid-cols-4">
          <InfoField label="총점" value={`${detail.totalScore}점`} />
          <InfoField label="등급" value={<GradeLetterBadge grade={detail.grade} />} />
          <InfoField label="합격여부" value={<GradePassBadge isPassed={detail.isPassed} />} />
          <InfoField
            label="수료여부"
            value={<GradeCompletionBadge isCompleted={detail.isCompleted} />}
          />
        </AdminCardContent>
        <p className="px-6 pb-4 text-xs text-[#9CA3AF]">
          수료여부는 합격 기준(진도율·시험 점수) 충족 여부로 판정하며, 수강기간이
          남아있어도 합격 기준을 충족하면 즉시 &quot;수료&quot;로 확정됩니다.
        </p>
      </AdminCard>
    </div>
  );
}
