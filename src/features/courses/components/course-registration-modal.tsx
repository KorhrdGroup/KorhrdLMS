"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  checkCourseNameDuplicateAction,
  createCourseAction,
} from "@/features/courses/actions/course-registration.actions";
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
import type { CourseRegistrationInput } from "@/features/courses/types/course.types";
import type { CourseStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

const INITIAL_FORM: CourseRegistrationInput = {
  name: "",
  code: "",
  categoryId: "",
  defaultDurationDays: "",
  completionAttendanceRate: "",
  completionExamScore: "",
  price: "",
  status: "active",
  description: "",
  professorName: "",
  studyMethod: COURSE_STUDY_METHOD_DEFAULT,
  lectureTime: COURSE_LECTURE_TIME_DEFAULT,
  supervisingAgency: COURSE_SUPERVISING_AGENCY_DEFAULT,
  isDeadlineSoon: false,
  regularPrice: String(COURSE_REGULAR_PRICE_DEFAULT),
  displayPrice: String(COURSE_DISPLAY_PRICE_DEFAULT),
  isFreeCourse: true,
  thumbnailUrl: "",
};

type CourseRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryOptions: CourseCategoryOption[];
  onSuccess?: (message: string) => void;
};

export function CourseRegistrationModal({
  open,
  onOpenChange,
  categoryOptions,
  onSuccess,
}: CourseRegistrationModalProps) {
  const [form, setForm] = useState<CourseRegistrationInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CourseRegistrationInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [nameVerified, setNameVerified] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [isCheckingName, startCheckName] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  function resetForm() {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setFormError(null);
    setNameVerified(false);
    setNameMessage(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function updateField<K extends keyof CourseRegistrationInput>(
    key: K,
    value: CourseRegistrationInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);

    if (key === "name") {
      setNameVerified(false);
      setNameMessage(null);
    }
  }

  function handleCheckName() {
    startCheckName(async () => {
      setNameMessage(null);
      setFieldErrors((current) => ({ ...current, name: undefined }));

      try {
        const result = await checkCourseNameDuplicateAction(form.name);
        setNameVerified(result.available);
        setNameMessage(result.message);

        if (!result.available) {
          setFieldErrors((current) => ({
            ...current,
            name: result.message,
          }));
        }
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "과정명 중복확인에 실패했습니다.",
        );
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await createCourseAction(form, nameVerified);

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
          error instanceof Error ? error.message : "과정 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="과정등록"
      description="새 과정 정보를 입력하고 저장하세요."
      className="flex max-h-[90vh] flex-col sm:max-w-2xl"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </AdminButton>
          <AdminButton
            type="submit"
            form="course-registration-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form
        id="course-registration-form"
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
            htmlFor="course-name"
            required
            error={fieldErrors.name}
            className="sm:col-span-2"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <AdminInput
                id="course-name"
                variant="outline"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="과정명"
                className="flex-1"
              />
              <AdminButton
                type="button"
                variant="outline"
                onClick={handleCheckName}
                disabled={isCheckingName || !form.name.trim()}
              >
                {isCheckingName ? "확인 중..." : "중복확인"}
              </AdminButton>
            </div>
            {nameMessage ? (
              <p
                className={cn(
                  "text-xs",
                  nameVerified ? "text-[#059669]" : "text-[#EF4444]",
                )}
              >
                {nameMessage}
              </p>
            ) : null}
          </CourseFormField>

          <CourseFormField
            label="과정코드"
            htmlFor="course-code"
            error={fieldErrors.code}
            hint="미입력 시 자동 생성"
          >
            <AdminInput
              id="course-code"
              variant="outline"
              value={form.code}
              onChange={(event) => updateField("code", event.target.value)}
              placeholder="예: CRS-101"
            />
          </CourseFormField>

          <CourseFormField
            label="과정분류"
            htmlFor="course-category"
            error={fieldErrors.categoryId}
            hint={
              categoryOptions.length === 0
                ? "카테고리관리에서 먼저 카테고리를 등록해주세요."
                : undefined
            }
          >
            <CourseFormSelect
              id="course-category"
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
            htmlFor="course-duration"
            error={fieldErrors.defaultDurationDays}
          >
            <AdminInput
              id="course-duration"
              type="number"
              min={1}
              variant="outline"
              value={form.defaultDurationDays}
              onChange={(event) =>
                updateField("defaultDurationDays", event.target.value)
              }
              placeholder="90"
            />
          </CourseFormField>

          <CourseFormField
            label="수강료(원)"
            htmlFor="course-price"
            error={fieldErrors.price}
            hint="미입력 시 수강료 문의로 표시"
          >
            <AdminInput
              id="course-price"
              type="number"
              min={0}
              step={1000}
              variant="outline"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="0"
            />
          </CourseFormField>

          <CourseFormField
            label="과정상태"
            htmlFor="course-status"
            error={fieldErrors.status}
          >
            <CourseFormSelect
              id="course-status"
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
            htmlFor="course-attendance"
            error={fieldErrors.completionAttendanceRate}
          >
            <AdminInput
              id="course-attendance"
              type="number"
              min={0}
              max={100}
              variant="outline"
              value={form.completionAttendanceRate}
              onChange={(event) =>
                updateField("completionAttendanceRate", event.target.value)
              }
              placeholder="80"
            />
          </CourseFormField>

          <CourseFormField
            label="수료기준 시험점수"
            htmlFor="course-exam-score"
            error={fieldErrors.completionExamScore}
          >
            <AdminInput
              id="course-exam-score"
              type="number"
              min={0}
              max={100}
              variant="outline"
              value={form.completionExamScore}
              onChange={(event) =>
                updateField("completionExamScore", event.target.value)
              }
              placeholder="60"
            />
          </CourseFormField>

          <CourseFormField
            label="담당교수"
            htmlFor="course-professor-name"
            error={fieldErrors.professorName}
            hint="학생 수강신청 과정 카드에 노출됩니다."
          >
            <AdminInput
              id="course-professor-name"
              variant="outline"
              value={form.professorName}
              onChange={(event) => updateField("professorName", event.target.value)}
              placeholder="예: 홍길동"
            />
          </CourseFormField>

          <CourseFormField
            label="수업방식"
            htmlFor="course-study-method"
            error={fieldErrors.studyMethod}
            hint="학생 수강신청 과정 카드에 노출됩니다."
          >
            <AdminInput
              id="course-study-method"
              variant="outline"
              value={form.studyMethod}
              onChange={(event) => updateField("studyMethod", event.target.value)}
              placeholder={COURSE_STUDY_METHOD_DEFAULT}
            />
          </CourseFormField>

          <CourseFormField
            label="강의시간"
            htmlFor="course-lecture-time"
            error={fieldErrors.lectureTime}
            hint="학생 수강신청 과정 카드에 노출됩니다."
          >
            <AdminInput
              id="course-lecture-time"
              variant="outline"
              value={form.lectureTime}
              onChange={(event) => updateField("lectureTime", event.target.value)}
              placeholder={COURSE_LECTURE_TIME_DEFAULT}
            />
          </CourseFormField>

          <CourseFormField
            label="주무관청"
            htmlFor="course-supervising-agency"
            error={fieldErrors.supervisingAgency}
            hint="학생 수강신청 과정 카드에 노출됩니다."
          >
            <AdminInput
              id="course-supervising-agency"
              variant="outline"
              value={form.supervisingAgency}
              onChange={(event) => updateField("supervisingAgency", event.target.value)}
              placeholder={COURSE_SUPERVISING_AGENCY_DEFAULT}
            />
          </CourseFormField>

          <CourseFormField
            label="정가(원)"
            htmlFor="course-regular-price"
            error={fieldErrors.regularPrice}
            hint="학생 카드에 취소선으로 표시됩니다."
          >
            <AdminInput
              id="course-regular-price"
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
            htmlFor="course-display-price"
            error={fieldErrors.displayPrice}
            hint="학생 카드에 강조 표시됩니다."
          >
            <AdminInput
              id="course-display-price"
              type="number"
              min={0}
              step={1000}
              variant="outline"
              value={form.displayPrice}
              onChange={(event) => updateField("displayPrice", event.target.value)}
              placeholder={String(COURSE_DISPLAY_PRICE_DEFAULT)}
            />
          </CourseFormField>

          <CourseFormField label="무료수강 여부" htmlFor="course-is-free">
            <label
              htmlFor="course-is-free"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="course-is-free"
                checked={form.isFreeCourse}
                onChange={(event) => updateField("isFreeCourse", event.target.checked)}
              />
              무료수강 과정으로 등록 (선결제 없이 학습 진행)
            </label>
          </CourseFormField>

          <CourseFormField label="마감임박 표시" htmlFor="course-is-deadline-soon">
            <label
              htmlFor="course-is-deadline-soon"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="course-is-deadline-soon"
                checked={form.isDeadlineSoon}
                onChange={(event) => updateField("isDeadlineSoon", event.target.checked)}
              />
              학생 수강신청 카드에 [마감임박] 배지 노출
            </label>
          </CourseFormField>

          <CourseThumbnailField
            idPrefix="course"
            value={form.thumbnailUrl}
            onChange={(url) => updateField("thumbnailUrl", url)}
            error={fieldErrors.thumbnailUrl}
          />
        </div>

        <CourseFormField
          label="과정설명"
          htmlFor="course-description"
          error={fieldErrors.description}
        >
          <CourseFormTextarea
            id="course-description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="과정 설명"
          />
        </CourseFormField>
      </form>
    </AdminModal>
  );
}
