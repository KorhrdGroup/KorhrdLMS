"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createNoticePopupAction,
  getNoticePopupForEditAction,
  updateNoticePopupAction,
} from "@/features/others/notice-popups/actions/notice-popup.actions";
import type { NoticePopupInput } from "@/features/others/notice-popups/types/notice-popup-form.types";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";

const INITIAL_FORM: NoticePopupInput = {
  title: "",
  content: "",
  isActive: false,
  isNotice: false,
  attachmentFileName: "",
  attachmentFileUrl: "",
  displayStartDate: "",
  displayEndDate: "",
  sortOrder: 0,
};

type NoticePopupFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popupId?: string | null;
  onSuccess?: (message: string) => void;
};

export function NoticePopupFormModal({
  open,
  onOpenChange,
  popupId = null,
  onSuccess,
}: NoticePopupFormModalProps) {
  const isEditMode = !!popupId;
  const [form, setForm] = useState<NoticePopupInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof NoticePopupInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!popupId) {
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setFormError(null);
      return;
    }

    startLoad(async () => {
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getNoticePopupForEditAction(popupId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(result.popup);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "공지팝업 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, popupId]);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting || isLoading) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof NoticePopupInput>(
    key: K,
    value: NoticePopupInput[K],
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
        const result = isEditMode
          ? await updateNoticePopupAction(popupId!, form)
          : await createNoticePopupAction(form);

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
          error instanceof Error ? error.message : "공지팝업 저장에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "공지팝업 수정" : "공지팝업 등록"}
      description={
        isEditMode ? "공지팝업 정보를 수정할 수 있습니다." : "새 공지팝업을 등록합니다."
      }
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
            form="notice-popup-form"
            disabled={isSubmitting || isLoading}
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
      ) : formError && isEditMode && !form.title ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {formError}
        </div>
      ) : (
        <form id="notice-popup-form" className="space-y-4" onSubmit={handleSubmit}>
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <EnrollmentFormField
            label="제목"
            htmlFor="popupTitle"
            required
            error={fieldErrors.title}
          >
            <AdminInput
              id="popupTitle"
              variant="outline"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="내용"
            htmlFor="popupContent"
            required
            error={fieldErrors.content}
          >
            <EnrollmentFormTextarea
              id="popupContent"
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
            />
          </EnrollmentFormField>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <AdminCheckbox
                checked={form.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
              />
              팝업 활성
            </label>
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <AdminCheckbox
                checked={form.isNotice}
                onChange={(event) => updateField("isNotice", event.target.checked)}
              />
              공지
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField label="노출 시작일" htmlFor="displayStartDate">
              <AdminInput
                id="displayStartDate"
                type="date"
                variant="outline"
                value={form.displayStartDate}
                onChange={(event) => updateField("displayStartDate", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField label="노출 종료일" htmlFor="displayEndDate">
              <AdminInput
                id="displayEndDate"
                type="date"
                variant="outline"
                value={form.displayEndDate}
                onChange={(event) => updateField("displayEndDate", event.target.value)}
              />
            </EnrollmentFormField>
          </div>

          <EnrollmentFormField
            label="정렬순서"
            htmlFor="sortOrder"
            required
            error={fieldErrors.sortOrder}
          >
            <AdminInput
              id="sortOrder"
              type="number"
              variant="outline"
              value={form.sortOrder}
              onChange={(event) => updateField("sortOrder", Number(event.target.value))}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="첨부파일명"
            htmlFor="attachmentFileName"
            error={fieldErrors.attachmentFileName}
          >
            <AdminInput
              id="attachmentFileName"
              variant="outline"
              value={form.attachmentFileName}
              onChange={(event) => updateField("attachmentFileName", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="첨부파일 URL"
            htmlFor="attachmentFileUrl"
            error={fieldErrors.attachmentFileUrl}
          >
            <AdminInput
              id="attachmentFileUrl"
              variant="outline"
              value={form.attachmentFileUrl}
              onChange={(event) => updateField("attachmentFileUrl", event.target.value)}
            />
          </EnrollmentFormField>
        </form>
      )}
    </AdminModal>
  );
}
