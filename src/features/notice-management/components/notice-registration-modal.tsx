"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import { createNoticeAction } from "@/features/notice-management/actions/notice-registration.actions";
import { NoticeAttachmentPicker } from "@/features/notice-management/components/notice-attachment-picker";
import type { NoticeRegistrationInput } from "@/features/notice-management/types/notice.types";

const INITIAL_FORM: NoticeRegistrationInput = {
  title: "",
  content: "",
  attachment: null,
  isPinned: false,
  isPublished: false,
};

type NoticeRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
};

export function NoticeRegistrationModal({
  open,
  onOpenChange,
  onSuccess,
}: NoticeRegistrationModalProps) {
  const [form, setForm] = useState<NoticeRegistrationInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof NoticeRegistrationInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  function resetForm() {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setFormError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function updateField<K extends keyof NoticeRegistrationInput>(
    key: K,
    value: NoticeRegistrationInput[K],
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
        const result = await createNoticeAction(form);

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
          error instanceof Error ? error.message : "공지 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="공지등록"
      description="새 공지사항을 입력하고 저장하세요."
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
          <AdminButton
            type="submit"
            form="notice-registration-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form
        id="notice-registration-form"
        className="max-h-[min(65vh,680px)] space-y-4 overflow-y-auto pr-1"
        onSubmit={handleSubmit}
      >
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {formError}
          </p>
        ) : null}

        <EnrollmentFormField
          label="제목"
          htmlFor="notice-title"
          required
          error={fieldErrors.title}
        >
          <AdminInput
            id="notice-title"
            variant="outline"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="예: 2026년 2학기 수강 안내"
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="내용 (에디터, Rich Text는 추후 적용 예정)"
          htmlFor="notice-content"
          required
          error={fieldErrors.content}
        >
          <EnrollmentFormTextarea
            id="notice-content"
            value={form.content}
            placeholder="공지 내용을 입력하세요"
            className="min-h-40"
            onChange={(event) => updateField("content", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="첨부파일"
          htmlFor="notice-attachment"
          error={fieldErrors.attachment}
        >
          <NoticeAttachmentPicker
            value={form.attachment}
            onChange={(attachment) => updateField("attachment", attachment)}
          />
          <p className="text-xs text-[#9CA3AF]">
            실제 업로드/저장은 아직 연결되지 않았습니다 (Mock). 파일명·용량만 저장됩니다.
          </p>
        </EnrollmentFormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <EnrollmentFormField label="상단고정" htmlFor="notice-is-pinned">
            <label
              htmlFor="notice-is-pinned"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="notice-is-pinned"
                checked={form.isPinned}
                onChange={(event) => updateField("isPinned", event.target.checked)}
              />
              목록 상단에 고정
            </label>
          </EnrollmentFormField>

          <EnrollmentFormField label="공개 여부" htmlFor="notice-is-published">
            <label
              htmlFor="notice-is-published"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="notice-is-published"
                checked={form.isPublished}
                onChange={(event) => updateField("isPublished", event.target.checked)}
              />
              공개 상태로 등록 (학생 화면에 노출)
            </label>
          </EnrollmentFormField>
        </div>
      </form>
    </AdminModal>
  );
}
