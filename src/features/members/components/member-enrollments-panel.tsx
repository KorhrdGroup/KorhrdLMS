"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

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

export type CourseOption = { id: string; name: string; category: string | null };

type MemberEnrollmentsPanelProps = {
  memberId: string;
  enrollments: EnrollmentRecordListItem[];
  /** 수강신청 대행에 쓸 노출 중 과정 목록 */
  courseOptions: CourseOption[];
};

const UNCATEGORIZED_LABEL = "미분류";
const AUTO_SAVE_DELAY_MS = 900;

type SaveState = "saving" | "saved" | "error";

/**
 * 회원 상세 > 수강정보 — 회원에 대한 학습 조작을 한곳에 모은 콘솔입니다.
 *
 * - 수강신청 대행: 분야 필터·검색으로 과정을 찾아 바로 확정 상태로 신청
 * - 진도율/시험점수: 입력을 멈추면 자동저장 (실제 lecture_progress·exam_submissions에 반영)
 * - 수강 취소: soft delete — 목록·학생 화면에서 사라집니다
 */
export function MemberEnrollmentsPanel({
  memberId,
  enrollments,
  courseOptions,
}: MemberEnrollmentsPanelProps) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});
  const [examInputs, setExamInputs] = useState<Record<string, string>>({});
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = saveTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const enrolledCourseNames = new Set(enrollments.map((e) => e.course.name));
  const availableCourses = courseOptions.filter((c) => !enrolledCourseNames.has(c.name));

  const categories = useMemo(() => {
    const names = new Set<string>();
    for (const course of availableCourses) {
      names.add(course.category ?? UNCATEGORIZED_LABEL);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ko"));
  }, [availableCourses]);

  const filteredCourses = useMemo(() => {
    const keyword = courseSearch.trim().toLowerCase();
    return availableCourses.filter((course) => {
      const category = course.category ?? UNCATEGORIZED_LABEL;
      if (categoryFilter !== "all" && category !== categoryFilter) return false;
      if (keyword && !course.name.toLowerCase().includes(keyword)) return false;
      return true;
    });
  }, [availableCourses, categoryFilter, courseSearch]);

  // 필터/검색으로 선택 중인 과정이 목록에서 사라지면 선택을 해제합니다.
  const selectedVisible = filteredCourses.some((c) => c.id === selectedCourseId);
  if (selectedCourseId && !selectedVisible) {
    setSelectedCourseId("");
  }

  const coursesByCategory = useMemo(() => {
    const groups = new Map<string, CourseOption[]>();
    for (const course of filteredCourses) {
      const category = course.category ?? UNCATEGORIZED_LABEL;
      const list = groups.get(category) ?? [];
      list.push(course);
      groups.set(category, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b, "ko"));
  }, [filteredCourses]);

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

  /** 입력을 멈추면 AUTO_SAVE_DELAY_MS 후 자동저장. 같은 칸을 다시 치면 타이머를 리셋합니다. */
  function scheduleAutoSave(
    key: string,
    rawValue: string,
    save: (value: number) => Promise<{ success: boolean; message?: string }>,
    onSaved: () => void,
  ) {
    clearTimeout(saveTimersRef.current[key]);

    if (!rawValue.trim()) {
      setSaveStates((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    saveTimersRef.current[key] = setTimeout(() => {
      const value = Number(rawValue);
      if (Number.isNaN(value) || value < 0 || value > 100) {
        setSaveStates((prev) => ({ ...prev, [key]: "error" }));
        setErrorMessage("0~100 사이의 숫자를 입력해주세요.");
        return;
      }

      setErrorMessage(null);
      setSaveStates((prev) => ({ ...prev, [key]: "saving" }));

      void save(value)
        .then((result) => {
          if (!result.success) {
            setSaveStates((prev) => ({ ...prev, [key]: "error" }));
            setErrorMessage(result.message ?? "저장에 실패했습니다.");
            return;
          }
          setSaveStates((prev) => ({ ...prev, [key]: "saved" }));
          onSaved();
          router.refresh();
        })
        .catch((error: unknown) => {
          setSaveStates((prev) => ({ ...prev, [key]: "error" }));
          setErrorMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
        });
    }, AUTO_SAVE_DELAY_MS);
  }

  function renderSaveState(key: string) {
    const state = saveStates[key];
    if (!state) return null;
    if (state === "saving") {
      return <span className="text-[11px] text-[#9CA3AF]">저장 중…</span>;
    }
    if (state === "saved") {
      return <span className="text-[11px] font-medium text-[#059669]">저장됨 ✓</span>;
    }
    return <span className="text-[11px] font-medium text-[#EF4444]">저장 실패</span>;
  }

  return (
    <div className="space-y-4">
      {/* ===================== 수강신청 대행 ===================== */}
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#111827]">수강신청 대행</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]"
          >
            <option value="all">전체 분야</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <AdminInput
            type="search"
            variant="outline"
            className="h-9 w-44"
            placeholder="과정명 검색"
            value={courseSearch}
            onChange={(event) => setCourseSearch(event.target.value)}
          />
          <select
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            className="h-9 min-w-[220px] rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]"
          >
            <option value="">
              과정 선택 ({filteredCourses.length}개)
            </option>
            {coursesByCategory.map(([category, courses]) => (
              <optgroup key={category} label={category}>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </optgroup>
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
        </div>
        <p className="mt-2 text-xs text-[#9CA3AF]">
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
              {enrollments.map((enrollment) => {
                const progressKey = `progress:${enrollment.id}`;
                const examKey = `exam:${enrollment.id}`;

                return (
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
                          onChange={(event) => {
                            const raw = event.target.value;
                            setProgressInputs((prev) => ({ ...prev, [enrollment.id]: raw }));
                            scheduleAutoSave(
                              progressKey,
                              raw,
                              (value) =>
                                updateGradeAttendanceAction(enrollment.id, {
                                  attendanceRate: value,
                                }),
                              () =>
                                setProgressInputs((prev) => ({ ...prev, [enrollment.id]: "" })),
                            );
                          }}
                        />
                        <span className="text-xs text-[#9CA3AF]">%</span>
                        {renderSaveState(progressKey)}
                      </div>
                      <p className="mt-1 text-[11px] text-[#9CA3AF]">
                        현재 {enrollment.progressRate}% · 입력하면 자동저장
                      </p>
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
                          onChange={(event) => {
                            const raw = event.target.value;
                            setExamInputs((prev) => ({ ...prev, [enrollment.id]: raw }));
                            scheduleAutoSave(
                              examKey,
                              raw,
                              (value) =>
                                updateGradeExamAction(enrollment.id, { examPercent: value }),
                              () => setExamInputs((prev) => ({ ...prev, [enrollment.id]: "" })),
                            );
                          }}
                        />
                        <span className="text-xs text-[#9CA3AF]">점</span>
                        {renderSaveState(examKey)}
                      </div>
                      <p className="mt-1 text-[11px] text-[#9CA3AF]">
                        현재 {enrollment.examStatus} · 60점 이상 자동 합격
                      </p>
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
                );
              })}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}
    </div>
  );
}
