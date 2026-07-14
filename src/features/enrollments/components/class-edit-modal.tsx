"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { updateClassAction } from "@/features/enrollments/actions/class-edit.actions";
import { getClassDetailAction } from "@/features/enrollments/actions/class.actions";
import { getClassRegistrationOptionsAction } from "@/features/enrollments/actions/class-registration.actions";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
} from "@/features/enrollments/components/enrollment-form-field";
import type { ClassDetail } from "@/features/enrollments/types/class-detail.types";
import type { ClassEditInput } from "@/features/enrollments/types/class-edit.types";
import type { ClassRegistrationCourseOption } from "@/features/enrollments/types/class-registration.types";
import { formatDate } from "@/lib/shared/format-date";

type ClassEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
  onSuccess?: (message: string) => void;
};

type ReadOnlyFieldProps = {
  label: string;
  value: React.ReactNode;
};

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function createFormFromDetail(detail: ClassDetail): ClassEditInput {
  return {
    courseId: detail.courseId,
    year: String(detail.year),
    batchName: detail.batchName,
    managerName: detail.managerName ?? "",
    applicationStart: detail.applicationPeriodStart ?? "",
    applicationEnd: detail.applicationPeriodEnd ?? "",
    enrollmentStart: detail.enrollmentPeriodStart,
    enrollmentEnd: detail.enrollmentPeriodEnd,
  };
}

export function ClassEditModal({
  open,
  onOpenChange,
  classId,
  onSuccess,
}: ClassEditModalProps) {
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [courses, setCourses] = useState<ClassRegistrationCourseOption[]>([]);
  const [form, setForm] = useState<ClassEditInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ClassEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !classId) {
      return;
    }

    startLoad(async () => {
      setDetail(null);
      setCourses([]);
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const [detailResult, optionsResult] = await Promise.all([
          getClassDetailAction(classId),
          getClassRegistrationOptionsAction(),
        ]);

        if (!detailResult.success) {
          setFormError(detailResult.message);
          return;
        }

        setDetail(detailResult.classDetail);
        setCourses(optionsResult.courses);
        setForm(createFormFromDetail(detailResult.classDetail));
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "수강반 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, classId]);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setDetail(null);
      setCourses([]);
      setForm(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof ClassEditInput>(
    key: K,
    value: ClassEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  const hasCourses = courses.length > 0;
  const canSubmit = !!form && !!detail && hasCourses && !isSubmitting && !isLoading;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form || !classId) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateClassAction(classId, form);

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
        onSuccess?.(result.message);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "수강반 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="수강반 수정"
      description="수강반 정보를 수정할 수 있습니다."
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
            form="class-edit-form"
            disabled={!canSubmit}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : formError && !form ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {formError}
        </div>
      ) : detail && form ? (
        <form id="class-edit-form" className="space-y-6" onSubmit={handleSubmit}>
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              기본 정보
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label="등록일" value={formatDate(detail.createdAt)} />
            </dl>
          </section>

          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              수정 정보
            </h3>

            <EnrollmentFormField
              label="과정"
              htmlFor="courseId"
              required
              error={fieldErrors.courseId}
            >
              <EnrollmentFormSelect
                id="courseId"
                value={form.courseId}
                disabled={!hasCourses}
                onChange={(event) => updateField("courseId", event.target.value)}
              >
                <option value="">
                  {hasCourses ? "과정 선택" : "등록된 과정 없음"}
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </EnrollmentFormSelect>
            </EnrollmentFormField>

            <EnrollmentFormField
              label="연도"
              htmlFor="year"
              required
              error={fieldErrors.year}
            >
              <AdminInput
                id="year"
                type="number"
                variant="outline"
                min={1900}
                max={9999}
                value={form.year}
                placeholder="예: 2026"
                onChange={(event) => updateField("year", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField
              label="반명"
              htmlFor="batchName"
              error={fieldErrors.batchName}
            >
              <AdminInput
                id="batchName"
                variant="outline"
                value={form.batchName}
                placeholder="예: 1반"
                onChange={(event) => updateField("batchName", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField
              label="담당자"
              htmlFor="managerName"
              error={fieldErrors.managerName}
            >
              <AdminInput
                id="managerName"
                variant="outline"
                value={form.managerName}
                placeholder="담당자명"
                onChange={(event) => updateField("managerName", event.target.value)}
              />
            </EnrollmentFormField>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-[#374151]">신청기간</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <EnrollmentFormField
                  label="시작"
                  htmlFor="applicationStart"
                  error={fieldErrors.applicationStart}
                >
                  <AdminInput
                    id="applicationStart"
                    type="date"
                    variant="outline"
                    value={form.applicationStart}
                    onChange={(event) =>
                      updateField("applicationStart", event.target.value)
                    }
                  />
                </EnrollmentFormField>

                <EnrollmentFormField
                  label="종료"
                  htmlFor="applicationEnd"
                  error={fieldErrors.applicationEnd}
                >
                  <AdminInput
                    id="applicationEnd"
                    type="date"
                    variant="outline"
                    value={form.applicationEnd}
                    onChange={(event) =>
                      updateField("applicationEnd", event.target.value)
                    }
                  />
                </EnrollmentFormField>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-[#374151]">
                수강기간<span className="text-[#EF4444]"> *</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <EnrollmentFormField
                  label="시작"
                  htmlFor="enrollmentStart"
                  required
                  error={fieldErrors.enrollmentStart}
                >
                  <AdminInput
                    id="enrollmentStart"
                    type="date"
                    variant="outline"
                    value={form.enrollmentStart}
                    onChange={(event) =>
                      updateField("enrollmentStart", event.target.value)
                    }
                  />
                </EnrollmentFormField>

                <EnrollmentFormField
                  label="종료"
                  htmlFor="enrollmentEnd"
                  required
                  error={fieldErrors.enrollmentEnd}
                >
                  <AdminInput
                    id="enrollmentEnd"
                    type="date"
                    variant="outline"
                    value={form.enrollmentEnd}
                    onChange={(event) =>
                      updateField("enrollmentEnd", event.target.value)
                    }
                  />
                </EnrollmentFormField>
              </div>
            </div>
          </section>
        </form>
      ) : null}
    </AdminModal>
  );
}
