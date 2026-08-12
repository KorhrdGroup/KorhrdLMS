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
import {
  updateGradeAttendanceAction,
  updateGradeExamAction,
} from "@/features/grades/actions/grade.actions";
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
  const [examInput, setExamInput] = useState(
    initialDetail.examPercent != null ? String(initialDetail.examPercent) : "",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [examError, setExamError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [isExamSubmitting, startExamSubmit] = useTransition();

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
        setSuccessMessage(
          "진도율을 수정했습니다. 학생 화면의 진도·총점·등급·합격여부에 그대로 반영됩니다.",
        );
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "출석점수 수정에 실패했습니다.",
        );
      }
    });
  }

  function handleExamSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExamError(null);
    setSuccessMessage(null);

    const examPercent = Number(examInput);

    startExamSubmit(async () => {
      try {
        const result = await updateGradeExamAction(detail.enrollmentId, { examPercent });

        if (!result.success) {
          setExamError(result.message);
          return;
        }

        setDetail(result.detail);
        setExamInput(
          result.detail.examPercent != null ? String(result.detail.examPercent) : "",
        );
        setSuccessMessage(
          "시험점수를 수정했습니다. 합격 기준 충족 여부와 총점·등급이 자동으로 반영됩니다.",
        );
        router.refresh();
      } catch (error) {
        setExamError(
          error instanceof Error ? error.message : "시험점수 수정에 실패했습니다.",
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
            <AdminCardTitle className="text-base">진도율(출석점수) 수정</AdminCardTitle>
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
                  진도율 % (0~100)
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
                  실제 진도 기록에 반영됩니다 — 앞 차시부터 입력 비율만큼 수강 완료로
                  바뀌고, 학생 화면 진도율과 총점·등급·합격여부가 함께 갱신됩니다.
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
            <AdminCardTitle className="text-base">시험점수 수정</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="pt-3">
            <form className="space-y-4" onSubmit={handleExamSubmit}>
              {examError ? (
                <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
                  {examError}
                </p>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="examPercent" className="block text-sm font-medium text-[#374151]">
                  시험점수 (0~100){" "}
                  <span className="font-normal text-[#9CA3AF]">
                    — 현재 {detail.examPercent != null ? `${detail.examPercent}점` : "미응시"}
                  </span>
                </label>
                <AdminInput
                  id="examPercent"
                  type="number"
                  min={0}
                  max={100}
                  variant="outline"
                  value={examInput}
                  placeholder="예: 80"
                  onChange={(event) => setExamInput(event.target.value)}
                />
                <p className="text-xs text-[#6B7280]">
                  수료시험 제출 기록에 바로 반영됩니다 — 미응시 상태여도 점수를 넣으면
                  응시한 것으로 만들어지고, 60점 이상이면 자동으로 합격 처리됩니다.
                </p>
              </div>

              <AdminButton type="submit" disabled={isExamSubmitting}>
                {isExamSubmitting ? "저장 중..." : "저장"}
              </AdminButton>
            </form>
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
