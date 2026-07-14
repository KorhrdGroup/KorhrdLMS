"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  getEnrollmentRecordForEditAction,
  updateEnrollmentRecordAction,
} from "@/features/enrollments/actions/enrollment-record.actions";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
} from "@/features/enrollments/components/enrollment-form-field";
import type {
  EnrollmentRecordEditInput,
  GetEnrollmentRecordForEditResult,
} from "@/features/enrollments/types/enrollment.types";

type EnrollmentRecordEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string | null;
  onSuccess?: (message: string) => void;
};

type LoadedRecord = Extract<GetEnrollmentRecordForEditResult, { success: true }>["record"];

export function EnrollmentRecordEditModal({
  open,
  onOpenChange,
  enrollmentId,
  onSuccess,
}: EnrollmentRecordEditModalProps) {
  const [record, setRecord] = useState<LoadedRecord | null>(null);
  const [form, setForm] = useState<EnrollmentRecordEditInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EnrollmentRecordEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !enrollmentId) {
      return;
    }

    startLoad(async () => {
      setRecord(null);
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getEnrollmentRecordForEditAction(enrollmentId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setRecord(result.record);
        setForm({
          startDate: result.record.startDate,
          endDate: result.record.endDate,
          learningStatus:
            result.record.learningStatus === "stopped" ? "stopped" : "in_progress",
        });
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "수강 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, enrollmentId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setRecord(null);
      setForm(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof EnrollmentRecordEditInput>(
    key: K,
    value: EnrollmentRecordEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!enrollmentId || !form) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateEnrollmentRecordAction(enrollmentId, form);

        if (!result.success) {
          if (result.field) {
            setFieldErrors((current) => ({
              ...current,
              [result.field!]: result.message,
            }));
          }
          setFormError(result.message);
          return;
        }

        handleOpenChange(false);
        onSuccess?.("수강 정보를 수정했습니다.");
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "수강 정보 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="수강수정"
      description="수강 기간과 상태를 수정할 수 있습니다."
      className="sm:max-w-lg"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            취소
          </AdminButton>
          <AdminButton
            type="submit"
            form="enrollment-record-edit-form"
            disabled={!form || isSubmitting || isLoading}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : record && form ? (
        <form
          id="enrollment-record-edit-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <div className="rounded-lg bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151]">
            <p>
              <span className="text-[#6B7280]">회원</span> {record.memberName}
            </p>
            <p className="mt-1">
              <span className="text-[#6B7280]">과정</span> {record.courseName}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField
              label="시작일"
              htmlFor="editStartDate"
              required
              error={fieldErrors.startDate}
            >
              <AdminInput
                id="editStartDate"
                type="date"
                variant="outline"
                value={form.startDate}
                onChange={(event) => updateField("startDate", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField
              label="종료일"
              htmlFor="editEndDate"
              required
              error={fieldErrors.endDate}
            >
              <AdminInput
                id="editEndDate"
                type="date"
                variant="outline"
                value={form.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
              />
            </EnrollmentFormField>
          </div>

          <EnrollmentFormField label="상태" htmlFor="editLearningStatus" required>
            <EnrollmentFormSelect
              id="editLearningStatus"
              value={form.learningStatus}
              onChange={(event) =>
                updateField(
                  "learningStatus",
                  event.target.value as EnrollmentRecordEditInput["learningStatus"],
                )
              }
            >
              <option value="in_progress">수강중</option>
              <option value="stopped">중지</option>
            </EnrollmentFormSelect>
            <p className="mt-1 text-xs text-[#6B7280]">
              종료일이 지나면 상태와 무관하게 목록에는 '종료'로 표시됩니다.
            </p>
          </EnrollmentFormField>
        </form>
      ) : (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "수강 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
