"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  getCourseForEditAction,
  updateCourseAction,
} from "@/features/courses/actions/course-edit.actions";
import {
  CourseFormField,
  CourseFormSelect,
  CourseFormTextarea,
} from "@/features/courses/components/course-form-field";
import { CourseThumbnailField } from "@/features/courses/components/course-thumbnail-field";
import {
  COURSE_DISPLAY_PRICE_DEFAULT,
  COURSE_LECTURE_TIME_DEFAULT,
  COURSE_REGULAR_PRICE_DEFAULT,
  COURSE_STATUS_LABELS,
  COURSE_STUDY_METHOD_DEFAULT,
  COURSE_SUPERVISING_AGENCY_DEFAULT,
} from "@/features/courses/constants";
import type { CourseCategoryOption } from "@/features/course-categories/types/course-category.types";
import type {
  CourseEditDetail,
  CourseEditInput,
} from "@/features/courses/types/course-edit.types";
import type { CourseStatus } from "@/types/database.types";

type CourseEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
  categoryOptions: CourseCategoryOption[];
  onSuccess?: (message: string) => void;
};

function createFormFromCourse(course: CourseEditDetail): CourseEditInput {
  return {
    name: course.name,
    code: course.code,
    categoryId: course.categoryId,
    defaultDurationDays: course.defaultDurationDays,
    completionAttendanceRate: course.completionAttendanceRate,
    completionExamScore: course.completionExamScore,
    price: course.price,
    status: course.status,
    description: course.description,
    professorName: course.professorName,
    studyMethod: course.studyMethod,
    lectureTime: course.lectureTime,
    supervisingAgency: course.supervisingAgency,
    isDeadlineSoon: course.isDeadlineSoon,
    regularPrice: course.regularPrice,
    displayPrice: course.displayPrice,
    isFreeCourse: course.isFreeCourse,
    thumbnailUrl: course.thumbnailUrl,
  };
}

export function CourseEditModal({
  open,
  onOpenChange,
  courseId,
  categoryOptions,
  onSuccess,
}: CourseEditModalProps) {
  const [form, setForm] = useState<CourseEditInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CourseEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !courseId) {
      return;
    }

    startLoad(async () => {
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getCourseForEditAction(courseId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(createFormFromCourse(result.course));
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "과정 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, courseId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof CourseEditInput>(
    key: K,
    value: CourseEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!courseId || !form) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateCourseAction(courseId, form);

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
          error instanceof Error ? error.message : "과정 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="과정수정"
      description="과정 정보를 수정하고 저장하세요."
      className="flex max-h-[90vh] flex-col sm:max-w-2xl"
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
            form="course-edit-form"
            disabled={isSubmitting || isLoading || !form}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#6B7280]">
          과정 정보를 불러오는 중...
        </div>
      ) : form ? (
        <form
          id="course-edit-form"
          className="max-h-[min(60vh,640px)] space-y-4 overflow-y-auto pr-1"
          onSubmit={handleSubmit}
        >
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <CourseFormField
              label="과정명"
              htmlFor="edit-course-name"
              required
              error={fieldErrors.name}
              className="sm:col-span-2"
            >
              <AdminInput
                id="edit-course-name"
                variant="outline"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </CourseFormField>

            <CourseFormField
              label="과정코드"
              htmlFor="edit-course-code"
              required
              error={fieldErrors.code}
            >
              <AdminInput
                id="edit-course-code"
                variant="outline"
                value={form.code}
                onChange={(event) => updateField("code", event.target.value)}
              />
            </CourseFormField>

            <CourseFormField
              label="과정분류"
              htmlFor="edit-course-category"
              error={fieldErrors.categoryId}
              hint={
                categoryOptions.length === 0
                  ? "카테고리관리에서 먼저 카테고리를 등록해주세요."
                  : undefined
              }
            >
              <CourseFormSelect
                id="edit-course-category"
                value={form.categoryId}
                onChange={(event) => updateField("categoryId", event.target.value)}
              >
                <option value="">미분류</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </CourseFormSelect>
            </CourseFormField>

            <CourseFormField
              label="수강기간(일)"
              htmlFor="edit-course-duration"
              error={fieldErrors.defaultDurationDays}
            >
              <AdminInput
                id="edit-course-duration"
                type="number"
                min={1}
                variant="outline"
                value={form.defaultDurationDays}
                onChange={(event) =>
                  updateField("defaultDurationDays", event.target.value)
                }
              />
            </CourseFormField>

            <CourseFormField
              label="수강료(원)"
              htmlFor="edit-course-price"
              error={fieldErrors.price}
              hint="미입력 시 수강료 문의로 표시"
            >
              <AdminInput
                id="edit-course-price"
                type="number"
                min={0}
                step={1000}
                variant="outline"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
              />
            </CourseFormField>

            <CourseFormField
              label="과정상태"
              htmlFor="edit-course-status"
              error={fieldErrors.status}
            >
              <CourseFormSelect
                id="edit-course-status"
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as CourseStatus)
                }
              >
                {Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </CourseFormSelect>
            </CourseFormField>

            <CourseFormField
              label="수료기준 출석률(%)"
              htmlFor="edit-course-attendance"
              error={fieldErrors.completionAttendanceRate}
            >
              <AdminInput
                id="edit-course-attendance"
                type="number"
                min={0}
                max={100}
                variant="outline"
                value={form.completionAttendanceRate}
                onChange={(event) =>
                  updateField("completionAttendanceRate", event.target.value)
                }
              />
            </CourseFormField>

            <CourseFormField
              label="수료기준 시험점수"
              htmlFor="edit-course-exam-score"
              error={fieldErrors.completionExamScore}
            >
              <AdminInput
                id="edit-course-exam-score"
                type="number"
                min={0}
                max={100}
                variant="outline"
                value={form.completionExamScore}
                onChange={(event) =>
                  updateField("completionExamScore", event.target.value)
                }
              />
            </CourseFormField>

            <CourseFormField
              label="담당교수"
              htmlFor="edit-course-professor-name"
              error={fieldErrors.professorName}
              hint="학생 수강신청 과정 카드에 노출됩니다."
            >
              <AdminInput
                id="edit-course-professor-name"
                variant="outline"
                value={form.professorName}
                onChange={(event) => updateField("professorName", event.target.value)}
                placeholder="예: 홍길동"
              />
            </CourseFormField>

            <CourseFormField
              label="수업방식"
              htmlFor="edit-course-study-method"
              error={fieldErrors.studyMethod}
              hint="학생 수강신청 과정 카드에 노출됩니다."
            >
              <AdminInput
                id="edit-course-study-method"
                variant="outline"
                value={form.studyMethod}
                onChange={(event) => updateField("studyMethod", event.target.value)}
                placeholder={COURSE_STUDY_METHOD_DEFAULT}
              />
            </CourseFormField>

            <CourseFormField
              label="강의시간"
              htmlFor="edit-course-lecture-time"
              error={fieldErrors.lectureTime}
              hint="학생 수강신청 과정 카드에 노출됩니다."
            >
              <AdminInput
                id="edit-course-lecture-time"
                variant="outline"
                value={form.lectureTime}
                onChange={(event) => updateField("lectureTime", event.target.value)}
                placeholder={COURSE_LECTURE_TIME_DEFAULT}
              />
            </CourseFormField>

            <CourseFormField
              label="주무관청"
              htmlFor="edit-course-supervising-agency"
              error={fieldErrors.supervisingAgency}
              hint="학생 수강신청 과정 카드에 노출됩니다."
            >
              <AdminInput
                id="edit-course-supervising-agency"
                variant="outline"
                value={form.supervisingAgency}
                onChange={(event) => updateField("supervisingAgency", event.target.value)}
                placeholder={COURSE_SUPERVISING_AGENCY_DEFAULT}
              />
            </CourseFormField>

            <CourseFormField
              label="정가(원)"
              htmlFor="edit-course-regular-price"
              error={fieldErrors.regularPrice}
              hint="학생 카드에 취소선으로 표시됩니다."
            >
              <AdminInput
                id="edit-course-regular-price"
                type="number"
                min={0}
                step={1000}
                variant="outline"
                value={form.regularPrice}
                onChange={(event) => updateField("regularPrice", event.target.value)}
                placeholder={String(COURSE_REGULAR_PRICE_DEFAULT)}
              />
            </CourseFormField>

            <CourseFormField
              label="표시가(원)"
              htmlFor="edit-course-display-price"
              error={fieldErrors.displayPrice}
              hint="학생 카드에 강조 표시됩니다."
            >
              <AdminInput
                id="edit-course-display-price"
                type="number"
                min={0}
                step={1000}
                variant="outline"
                value={form.displayPrice}
                onChange={(event) => updateField("displayPrice", event.target.value)}
                placeholder={String(COURSE_DISPLAY_PRICE_DEFAULT)}
              />
            </CourseFormField>

            <CourseFormField label="무료수강 여부" htmlFor="edit-course-is-free">
              <label
                htmlFor="edit-course-is-free"
                className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
              >
                <AdminCheckbox
                  id="edit-course-is-free"
                  checked={form.isFreeCourse}
                  onChange={(event) => updateField("isFreeCourse", event.target.checked)}
                />
                무료수강 과정으로 표시 (선결제 없이 학습 진행)
              </label>
            </CourseFormField>

            <CourseFormField label="마감임박 표시" htmlFor="edit-course-is-deadline-soon">
              <label
                htmlFor="edit-course-is-deadline-soon"
                className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
              >
                <AdminCheckbox
                  id="edit-course-is-deadline-soon"
                  checked={form.isDeadlineSoon}
                  onChange={(event) => updateField("isDeadlineSoon", event.target.checked)}
                />
                학생 수강신청 카드에 [마감임박] 배지 노출
              </label>
            </CourseFormField>

            <CourseThumbnailField
              idPrefix="edit-course"
              value={form.thumbnailUrl}
              onChange={(url) => updateField("thumbnailUrl", url)}
              error={fieldErrors.thumbnailUrl}
            />
          </div>

          <CourseFormField
            label="과정설명"
            htmlFor="edit-course-description"
            error={fieldErrors.description}
          >
            <CourseFormTextarea
              id="edit-course-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </CourseFormField>
        </form>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "과정 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
