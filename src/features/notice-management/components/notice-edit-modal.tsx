"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import {
  getNoticeForEditAction,
  updateNoticeAction,
} from "@/features/notice-management/actions/notice-edit.actions";
import { NoticeAttachmentPicker } from "@/features/notice-management/components/notice-attachment-picker";
import type {
  NoticeEditDetail,
  NoticeEditInput,
} from "@/features/notice-management/types/notice.types";

type NoticeEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noticeId: string | null;
  onSuccess?: (message: string) => void;
};

function createFormFromDetail(detail: NoticeEditDetail): NoticeEditInput {
  return {
    title: detail.title,
    content: detail.content,
    attachment: null,
    isPinned: detail.isPinned,
    isPublished: detail.isPublished,
  };
}

export function NoticeEditModal({
  open,
  onOpenChange,
  noticeId,
  onSuccess,
}: NoticeEditModalProps) {
  const [form, setForm] = useState<NoticeEditInput | null>(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof NoticeEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !noticeId) {
      return;
    }

    startLoad(async () => {
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getNoticeForEditAction(noticeId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(createFormFromDetail(result.notice));
        setExistingFileName(result.notice.attachment?.fileName ?? "");
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "공지 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, noticeId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm(null);
      setExistingFileName("");
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof NoticeEditInput>(
    key: K,
    value: NoticeEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!noticeId || !form) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateNoticeAction(noticeId, form);

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
          error instanceof Error ? error.message : "공지 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="공지수정"
      description="공지사항 내용을 수정하고 저장하세요."
      className="flex max-h-[90vh] flex-col sm:max-w-xl"
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
            form="notice-edit-form"
            disabled={isSubmitting || isLoading || !form}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#6B7280]">
          공지 정보를 불러오는 중...
        </div>
      ) : form ? (
        <form
          id="notice-edit-form"
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
            htmlFor="edit-notice-title"
            required
            error={fieldErrors.title}
          >
            <AdminInput
              id="edit-notice-title"
              variant="outline"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="내용 (에디터, Rich Text는 추후 적용 예정)"
            htmlFor="edit-notice-content"
            required
            error={fieldErrors.content}
          >
            <EnrollmentFormTextarea
              id="edit-notice-content"
              value={form.content}
              className="min-h-40"
              onChange={(event) => updateField("content", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="첨부파일"
            htmlFor="edit-notice-attachment"
            error={fieldErrors.attachment}
          >
            <NoticeAttachmentPicker
              value={form.attachment}
              existingFileName={existingFileName}
              onChange={(attachment) => updateField("attachment", attachment)}
            />
            <p className="text-xs text-[#9CA3AF]">
              새 파일을 선택하지 않으면 기존 첨부파일이 그대로 유지됩니다.
            </p>
          </EnrollmentFormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField label="상단고정" htmlFor="edit-notice-is-pinned">
              <label
                htmlFor="edit-notice-is-pinned"
                className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
              >
                <AdminCheckbox
                  id="edit-notice-is-pinned"
                  checked={form.isPinned}
                  onChange={(event) => updateField("isPinned", event.target.checked)}
                />
                목록 상단에 고정
              </label>
            </EnrollmentFormField>

            <EnrollmentFormField label="공개 여부" htmlFor="edit-notice-is-published">
              <label
                htmlFor="edit-notice-is-published"
                className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
              >
                <AdminCheckbox
                  id="edit-notice-is-published"
                  checked={form.isPublished}
                  onChange={(event) => updateField("isPublished", event.target.checked)}
                />
                공개 상태로 전환 (학생 화면에 노출)
              </label>
            </EnrollmentFormField>
          </div>
        </form>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "공지 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
