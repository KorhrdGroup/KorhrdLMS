"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { CourseFormField } from "@/features/courses/components/course-form-field";
import { CourseStringListField } from "@/features/courses/components/course-string-list-field";
import {
  createProfessorAction,
  updateProfessorAction,
} from "@/features/professors/actions/professor.actions";
import { ProfessorPhotoField } from "@/features/professors/components/professor-photo-field";
import type {
  ProfessorFormInput,
  ProfessorListItem,
} from "@/features/professors/types/professor.types";

const INITIAL_FORM: ProfessorFormInput = {
  name: "",
  bio: [],
  photoUrl: "",
};

type ProfessorFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professor: ProfessorListItem | null;
  onSuccess?: (message: string) => void;
};

function toForm(professor: ProfessorListItem | null): ProfessorFormInput {
  if (!professor) {
    return INITIAL_FORM;
  }

  return {
    name: professor.name,
    bio: professor.bio,
    photoUrl: professor.photoUrl ?? "",
  };
}

export function ProfessorFormModal({
  open,
  onOpenChange,
  professor,
  onSuccess,
}: ProfessorFormModalProps) {
  const isEdit = Boolean(professor);
  const [form, setForm] = useState<ProfessorFormInput>(() => toForm(professor));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProfessorFormInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  // 모달을 열 때마다(또는 수정 대상이 바뀔 때마다) 폼을 최신 값으로 되돌립니다.
  const resetKey = `${open ? "open" : "closed"}:${professor?.id ?? "new"}`;
  const [syncedKey, setSyncedKey] = useState(resetKey);
  if (open && syncedKey !== resetKey) {
    setSyncedKey(resetKey);
    setForm(toForm(professor));
    setFieldErrors({});
    setFormError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  }

  function updateField<K extends keyof ProfessorFormInput>(
    key: K,
    value: ProfessorFormInput[K],
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
        const result = professor
          ? await updateProfessorAction(professor.id, form)
          : await createProfessorAction(form);

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
          error instanceof Error ? error.message : "교수 정보 저장에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "교수 수정" : "교수 등록"}
      description="교수 이력과 사진은 담당 과정 전체의 상세페이지에 반영됩니다."
      className="flex max-h-[90vh] flex-col sm:max-w-xl"
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
          <AdminButton type="submit" form="professor-form" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form
        id="professor-form"
        className="max-h-[min(60vh,560px)] space-y-4 overflow-y-auto pr-1"
        onSubmit={handleSubmit}
      >
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{formError}</p>
        ) : null}

        <CourseFormField
          label="교수명"
          htmlFor="professor-name"
          required
          error={fieldErrors.name}
        >
          <AdminInput
            id="professor-name"
            variant="outline"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="예: 전현영 교수"
          />
        </CourseFormField>

        <ProfessorPhotoField
          value={form.photoUrl}
          onChange={(url) => updateField("photoUrl", url)}
          professorName={form.name}
          error={fieldErrors.photoUrl}
        />

        <CourseStringListField
          label="이력"
          idPrefix="professor-bio"
          items={form.bio}
          onChange={(items) => updateField("bio", items)}
          placeholder="예: [ 소속 ] 한국직업능력검정협회 편집부"
          hint="상세페이지 교수 소개에 한 줄씩 노출됩니다. [ 소속 ] / [ 학력 및 전공 ] 라벨로 시작하면 칸이 나뉩니다."
          error={fieldErrors.bio}
        />
      </form>
    </AdminModal>
  );
}
