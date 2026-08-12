"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { EnrollmentLearningStatusBadge } from "@/features/enrollments/components/enrollment-learning-status-badge";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";
import {
  updateGradeAttendanceAction,
  updateGradeExamAction,
} from "@/features/grades/actions/grade.actions";
import {
  adminCancelEnrollmentAction,
  adminEnrollMemberAction,
} from "@/features/members/actions/member-learning.actions";
import { formatDate } from "@/lib/shared/format-date";

export type CourseOption = { id: string; name: string };

type MemberEnrollmentsPanelProps = {
  memberId: string;
  enrollments: EnrollmentRecordListItem[];
  /** 수강신청 대행에 쓸 노출 중 과정 목록 */
  courseOptions: CourseOption[];
};

/**
 * 회원 상세 > 수강정보 — 회원에 대한 학습 조작을 한곳에 모은 콘솔입니다.
 *
 * - 수강신청 대행: 관리자가 회원 대신 과정을 바로 확정 상태로 신청
 * - 진도율 수정: 실제 진도 기록(lecture_progress)에 반영 (성적관리와 같은 액션)
 * - 시험점수 수정: 수료시험 제출을 생성/덮어쓰기, 60점 이상 자동 합격
 * - 수강 취소: soft delete — 목록·학생 화면에서 사라집니다
 */
export function MemberEnrollmentsPanel({
  memberId,
  enrollments,
  courseOptions,
}: MemberEnrollmentsPanelProps) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});
  const [examInputs, setExamInputs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const enrolledCourseNames = new Set(enrollments.map((e) => e.course.name));
  const availableCourses = courseOptions.filter((c) => !enrolledCourseNames.has(c.name));

  function run(task: () => Promise<{ success: boolean; message?: string }>, doneMessage?: string) {
    setMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const result = await task();
        if (!result.success) {
          setErrorMessage(result.message ?? "처리에 실패했습니다.");
          return;
        }
        setMessage(doneMessage ?? result.message ?? "처리했습니다.");
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "처리에 실패했습니다.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* ===================== 수강신청 대행 ===================== */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
        <span className="text-sm font-semibold text-[#111827]">수강신청 대행</span>
        <select
          value={selectedCourseId}
          onChange={(event) => setSelectedCourseId(event.target.value)}
          className="h-9 min-w-[220px] rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]"
        >
          <option value="">과정 선택</option>
          {availableCourses.map((course) => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
        <AdminButton
          type="button"
          disabled={isPending || !selectedCourseId}
          onClick={() => {
            run(() => adminEnrollMemberAction(memberId, selectedCourseId));
            setSelectedCourseId("");
          }}
        >
          바로 신청 (확정)
        </AdminButton>
        <p className="w-full text-xs text-[#9CA3AF] sm:w-auto">
          결제 없이 확정·결제완료 상태로 등록됩니다. 학생 화면에 바로 나타납니다.
        </p>
      </div>

      {message ? (
        <p className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm text-[#059669]">{message}</p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-lg bg-[#FEF2F2] px-3 py-2 text-sm text-[#EF4444]">{errorMessage}</p>
      ) : null}

      {/* ===================== 수강 목록 + 조작 ===================== */}
      {enrollments.length === 0 ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-sm text-[#9CA3AF]">
          <p>등록된 수강 정보가 없습니다.</p>
          <p className="text-xs">위 수강신청 대행으로 바로 등록할 수 있습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow className="hover:bg-transparent">
                <AdminTableHead>과정명</AdminTableHead>
                <AdminTableHead>수강기간</AdminTableHead>
                <AdminTableHead>상태</AdminTableHead>
                <AdminTableHead>진도율 수정</AdminTableHead>
                <AdminTableHead>시험점수 수정</AdminTableHead>
                <AdminTableHead>수료여부</AdminTableHead>
                <AdminTableHead className="text-right">관리</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {enrollments.map((enrollment) => (
                <AdminTableRow key={enrollment.id}>
                  <AdminTableCell className="font-medium">
                    {enrollment.course.name}
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap text-[#6B7280]">
                    {formatDate(enrollment.start_date)} ~ {formatDate(enrollment.end_date)}
                  </AdminTableCell>
                  <AdminTableCell>
                    <EnrollmentLearningStatusBadge status={enrollment.learningStatus} />
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1.5">
                      <AdminInput
                        type="number"
                        min={0}
                        max={100}
                        variant="outline"
                        className="h-8 w-20"
                        placeholder={`${enrollment.progressRate}`}
                        value={progressInputs[enrollment.id] ?? ""}
                        onChange={(event) =>
                          setProgressInputs((prev) => ({ ...prev, [enrollment.id]: event.target.value }))
                        }
                      />
                      <span className="text-xs text-[#9CA3AF]">%</span>
                      <AdminButton
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || !(progressInputs[enrollment.id] ?? "").trim()}
                        onClick={() =>
                          run(
                            () =>
                              updateGradeAttendanceAction(enrollment.id, {
                                attendanceRate: Number(progressInputs[enrollment.id]),
                              }),
                            "진도율을 수정했습니다. 학생 화면에도 그대로 반영됩니다.",
                          )
                        }
                      >
                        저장
                      </AdminButton>
                    </div>
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">현재 {enrollment.progressRate}%</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex items-center gap-1.5">
                      <AdminInput
                        type="number"
                        min={0}
                        max={100}
                        variant="outline"
                        className="h-8 w-20"
                        placeholder="점수"
                        value={examInputs[enrollment.id] ?? ""}
                        onChange={(event) =>
                          setExamInputs((prev) => ({ ...prev, [enrollment.id]: event.target.value }))
                        }
                      />
                      <span className="text-xs text-[#9CA3AF]">점</span>
                      <AdminButton
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || !(examInputs[enrollment.id] ?? "").trim()}
                        onClick={() =>
                          run(
                            () =>
                              updateGradeExamAction(enrollment.id, {
                                examPercent: Number(examInputs[enrollment.id]),
                              }),
                            "시험점수를 수정했습니다. 60점 이상이면 자동 합격 처리됩니다.",
                          )
                        }
                      >
                        저장
                      </AdminButton>
                    </div>
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">현재 {enrollment.examStatus}</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    {enrollment.isCompleted ? (
                      <span className="inline-flex rounded-md bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#059669]">
                        수료
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#9CA3AF]">
                        미수료
                      </span>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/admin/grades/${enrollment.id}`}
                        className="rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#374151]"
                      >
                        성적 상세
                      </Link>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          if (!window.confirm(`"${enrollment.course.name}" 수강을 취소할까요?\n학생 화면에서 사라집니다.`)) return;
                          run(() => adminCancelEnrollmentAction(enrollment.id), "수강을 취소했습니다.");
                        }}
                        className="rounded-md border border-[#F4C9CD] px-2.5 py-1.5 text-xs text-[#EF4444]"
                      >
                        수강 취소
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}
    </div>
  );
}
