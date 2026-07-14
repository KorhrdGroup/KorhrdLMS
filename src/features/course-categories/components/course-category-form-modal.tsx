"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createCourseCategoryAction,
  updateCourseCategoryAction,
} from "@/features/course-categories/actions/course-category.actions";
import { CourseFormField, CourseFormTextarea } from "@/features/courses/components/course-form-field";
import type {
  CourseCategoryFormInput,
  CourseCategoryListItem,
} from "@/features/course-categories/types/course-category.types";

const INITIAL_FORM: CourseCategoryFormInput = {
  name: "",
  slug: "",
  description: "",
};

type CourseCategoryFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CourseCategoryListItem | null;
  onSuccess?: (message: string) => void;
};

function toForm(category: CourseCategoryListItem | null): CourseCategoryFormInput {
  if (!category) {
    return INITIAL_FORM;
  }

  return {
    name: category.name,
    slug: category.slug ?? "",
    description: category.description ?? "",
  };
}

export function CourseCategoryFormModal({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CourseCategoryFormModalProps) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState<CourseCategoryFormInput>(() => toForm(category));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CourseCategoryFormInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  // 모달을 열 때마다(또는 수정 대상이 바뀔 때마다) 폼을 최신 값으로 되돌립니다.
  // Dialog 컴포넌트가 닫혀도 언마운트되지 않으므로 렌더링 중 상태를 동기화합니다.
  const resetKey = `${open ? "open" : "closed"}:${category?.id ?? "new"}`;
  const [syncedKey, setSyncedKey] = useState(resetKey);
  if (open && syncedKey !== resetKey) {
    setSyncedKey(resetKey);
    setForm(toForm(category));
    setFieldErrors({});
    setFormError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  }

  function updateField<K extends keyof CourseCategoryFormInput>(
    key: K,
    value: CourseCategoryFormInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = category
          ? await updateCourseCategoryAction(category.id, form)
          : await createCourseCategoryAction(form);

        if (!result.success) {
          if (result.field) {
            setFieldErrors((current) => ({ ...current, [result.field!]: result.message }));
          }
          setFormError(result.message);
          return;
        }

        handleOpenChange(false);
        onSuccess?.(result.message);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "카테고리 저장에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "카테고리 수정" : "카테고리 등록"}
      description="과정 분류(카테고리) 정보를 입력하고 저장하세요."
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
          <AdminButton type="submit" form="course-category-form" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form id="course-category-form" className="space-y-4" onSubmit={handleSubmit}>
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{formError}</p>
        ) : null}

        <CourseFormField
          label="카테고리명"
          htmlFor="course-category-name"
          required
          error={fieldErrors.name}
        >
          <AdminInput
            id="course-category-name"
            variant="outline"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="예: 실버/돌봄 과정"
          />
        </CourseFormField>

        <CourseFormField
          label="슬러그"
          htmlFor="course-category-slug"
          error={fieldErrors.slug}
          hint="영문 소문자, 숫자, - 만 사용 (선택 입력)"
        >
          <AdminInput
            id="course-category-slug"
            variant="outline"
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            placeholder="예: silver-care"
          />
        </CourseFormField>

        <CourseFormField
          label="설명"
          htmlFor="course-category-description"
          error={fieldErrors.description}
        >
          <CourseFormTextarea
            id="course-category-description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="카테고리 설명(선택)"
          />
        </CourseFormField>
      </form>
    </AdminModal>
  );
}
