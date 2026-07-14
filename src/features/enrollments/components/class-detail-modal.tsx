"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { getClassDetailAction } from "@/features/enrollments/actions/class.actions";
import { ClassAssignedStudentsTable } from "@/features/enrollments/components/class-assigned-students-table";
import type { ClassDetail } from "@/features/enrollments/types/class-detail.types";
import type { ClassDeleteTarget } from "@/features/enrollments/types/class-delete.types";
import { formatDate } from "@/lib/shared/format-date";

type ClassDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
  onEditClick?: (classId: string) => void;
  onDeleteClick?: (target: ClassDeleteTarget) => void;
};

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function formatPeriod(start: string | null, end: string | null) {
  if (!start && !end) {
    return "—";
  }

  if (start && end) {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  }

  return start ? formatDate(start) : formatDate(end!);
}

export function ClassDetailModal({
  open,
  onOpenChange,
  classId,
  onEditClick,
  onDeleteClick,
}: ClassDetailModalProps) {
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();

  useEffect(() => {
    if (!open || !classId) {
      return;
    }

    startLoad(async () => {
      setDetail(null);
      setErrorMessage(null);

      try {
        const result = await getClassDetailAction(classId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        setDetail(result.classDetail);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "수강반 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, classId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setDetail(null);
      setErrorMessage(null);
    }
  }

  function createDeleteTarget(detail: ClassDetail): ClassDeleteTarget {
    return {
      id: detail.id,
      courseName: detail.courseName,
      batchName: detail.batchName,
      year: detail.year,
    };
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="수강반 상세"
      description="수강반 상세 정보를 확인할 수 있습니다."
      className="sm:max-w-3xl"
      footer={
        <>
          {classId && onEditClick ? (
            <AdminButton
              type="button"
              onClick={() => {
                onEditClick(classId);
                handleOpenChange(false);
              }}
            >
              수정
            </AdminButton>
          ) : null}
          {detail && onDeleteClick ? (
            <AdminButton
              type="button"
              variant="destructive"
              onClick={() => {
                onDeleteClick(createDeleteTarget(detail));
                handleOpenChange(false);
              }}
            >
              삭제
            </AdminButton>
          ) : null}
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            닫기
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : errorMessage ? (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : detail ? (
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              반 정보
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="과정명" value={detail.courseName} />
              <DetailField label="연도" value={detail.year} />
              <DetailField label="반명" value={detail.batchName} />
              <DetailField label="담당자" value={detail.managerName ?? "—"} />
              <DetailField
                label="신청기간"
                value={formatPeriod(
                  detail.applicationPeriodStart,
                  detail.applicationPeriodEnd,
                )}
              />
              <DetailField
                label="수강기간"
                value={formatPeriod(
                  detail.enrollmentPeriodStart,
                  detail.enrollmentPeriodEnd,
                )}
              />
              <DetailField label="등록일" value={formatDate(detail.createdAt)} />
            </dl>
          </section>

          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              배정 수강생
            </h3>
            <ClassAssignedStudentsTable students={detail.students} />
          </section>
        </div>
      ) : null}
    </AdminModal>
  );
}
