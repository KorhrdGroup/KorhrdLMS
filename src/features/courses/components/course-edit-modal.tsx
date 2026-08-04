"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  getCourseDetailEditOptionsAction,
  getCourseForEditAction,
  updateCourseAction,
} from "@/features/courses/actions/course-edit.actions";
import {
  CourseFormField,
  CourseFormSelect,
  CourseFormTextarea,
} from "@/features/courses/components/course-form-field";
import { CourseStringListField } from "@/features/courses/components/course-string-list-field";
import { CourseThumbnailField } from "@/features/courses/components/course-thumbnail-field";
import {
  COURSE_CERTIFICATE_FEE_DEFAULT,
  COURSE_DISPLAY_PRICE_DEFAULT,
  COURSE_LECTURE_FORMAT_DEFAULT,
  COURSE_LECTURE_TIME_DEFAULT,
  COURSE_REGULAR_PRICE_DEFAULT,
  COURSE_STATUS_LABELS,
  COURSE_STUDY_METHOD_DEFAULT,
  COURSE_SUPERVISING_AGENCY_DEFAULT,
} from "@/features/courses/constants";
import type { CourseCategoryOption } from "@/features/course-categories/types/course-category.types";
import type {
  CourseDetailEditOptions,
  CourseEditDetail,
  CourseEditInput,
} from "@/features/courses/types/course-edit.types";
import type { CourseStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

type CourseEditTab = "basic" | "detail";

const COURSE_EDIT_TABS: { value: CourseEditTab; label: string }[] = [
  { value: "basic", label: "기본 정보" },
  { value: "detail", label: "상세페이지" },
];

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
    heroDescription: course.heroDescription,
    licenseNumber: course.licenseNumber,
    lectureFormat: course.lectureFormat,
    certificateFee: course.certificateFee,
    targetAudience: course.targetAudience,
    careerPaths: course.careerPaths,
    professorId: course.professorId,
    issuingAgencyId: course.issuingAgencyId,
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
  const [activeTab, setActiveTab] = useState<CourseEditTab>("basic");
  const [detailOptions, setDetailOptions] = useState<CourseDetailEditOptions>({
    professors: [],
    agencies: [],
  });
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
      setActiveTab("basic");

      try {
        const [result, options] = await Promise.all([
          getCourseForEditAction(courseId),
          getCourseDetailEditOptionsAction(),
        ]);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setDetailOptions(options);
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
      setActiveTab("basic");
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

          {/* 두 탭 모두 마운트를 유지하고 숨김 처리만 합니다(썸네일 업로드 등 내부 상태 보존). */}
          <div className="flex gap-1 border-b border-[#E5E7EB]" role="tablist">
            {COURSE_EDIT_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.value
                    ? "border-[#3B82F6] text-[#3B82F6]"
                    : "border-transparent text-[#6B7280] hover:text-[#111827]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={cn("space-y-4", activeTab !== "basic" && "hidden")}>
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
          </div>

          {/* ── 상세페이지 탭 — /courses/[slug] 화면에 노출되는 내용 ── */}
          <div className={cn("space-y-4", activeTab !== "detail" && "hidden")}>
            <CourseFormField
              label="자격증 소개 (~란?)"
              htmlFor="edit-course-hero-description"
              error={fieldErrors.heroDescription}
              hint="상세페이지 최상단 히어로에 노출됩니다. 3줄(약 250자) 이내를 권장합니다."
            >
              <CourseFormTextarea
                id="edit-course-hero-description"
                value={form.heroDescription}
                onChange={(event) => updateField("heroDescription", event.target.value)}
                placeholder="예: 생활지원사는 노인맞춤돌봄서비스를 제공하는 전문 인력입니다…"
              />
            </CourseFormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <CourseFormField
                label="민간자격등록번호"
                htmlFor="edit-course-license-number"
                error={fieldErrors.licenseNumber}
              >
                <AdminInput
                  id="edit-course-license-number"
                  variant="outline"
                  value={form.licenseNumber}
                  onChange={(event) => updateField("licenseNumber", event.target.value)}
                  placeholder="예: 2024-005425"
                />
              </CourseFormField>

              <CourseFormField
                label="강의형태"
                htmlFor="edit-course-lecture-format"
                error={fieldErrors.lectureFormat}
              >
                <AdminInput
                  id="edit-course-lecture-format"
                  variant="outline"
                  value={form.lectureFormat}
                  onChange={(event) => updateField("lectureFormat", event.target.value)}
                  placeholder={COURSE_LECTURE_FORMAT_DEFAULT}
                />
              </CourseFormField>

              <CourseFormField
                label="자격증 발급비(원)"
                htmlFor="edit-course-certificate-fee"
                error={fieldErrors.certificateFee}
                hint="수강료와 별개로 상세페이지 스펙 카드에 노출됩니다."
              >
                <AdminInput
                  id="edit-course-certificate-fee"
                  type="number"
                  min={0}
                  step={1000}
                  variant="outline"
                  value={form.certificateFee}
                  onChange={(event) => updateField("certificateFee", event.target.value)}
                  placeholder={String(COURSE_CERTIFICATE_FEE_DEFAULT)}
                />
              </CourseFormField>

              <CourseFormField
                label="담당 교수"
                htmlFor="edit-course-professor-id"
                error={fieldErrors.professorId}
                hint="교수 이력·사진이 상세페이지 교수 소개에 노출됩니다."
              >
                <CourseFormSelect
                  id="edit-course-professor-id"
                  value={form.professorId}
                  onChange={(event) => updateField("professorId", event.target.value)}
                >
                  <option value="">미지정</option>
                  {detailOptions.professors.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.name}
                    </option>
                  ))}
                </CourseFormSelect>
              </CourseFormField>

              <CourseFormField
                label="자격관리기관"
                htmlFor="edit-course-issuing-agency"
                error={fieldErrors.issuingAgencyId}
                hint="상세페이지 하단 자격관리기관 정보 표에 노출됩니다."
                className="sm:col-span-2"
              >
                <CourseFormSelect
                  id="edit-course-issuing-agency"
                  value={form.issuingAgencyId}
                  onChange={(event) => updateField("issuingAgencyId", event.target.value)}
                >
                  <option value="">미지정</option>
                  {detailOptions.agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </CourseFormSelect>
              </CourseFormField>
            </div>

            <CourseStringListField
              label="이런 분들에게 유용해요"
              idPrefix="edit-course-target"
              items={form.targetAudience}
              onChange={(items) => updateField("targetAudience", items)}
              placeholder="예: 퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분"
              hint="상세페이지 추천 대상 카드로 순서대로 노출됩니다."
              error={fieldErrors.targetAudience}
            />

            <CourseStringListField
              label="진로 및 전망"
              idPrefix="edit-course-career"
              items={form.careerPaths}
              onChange={(items) => updateField("careerPaths", items)}
              placeholder="예: 노인맞춤돌봄서비스 생활지원사 (지자체 및 수행기관)"
              hint="상세페이지 과정 상세 소개에 순서대로 노출됩니다."
              error={fieldErrors.careerPaths}
            />
          </div>
        </form>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "과정 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
