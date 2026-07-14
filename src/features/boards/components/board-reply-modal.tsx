"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { createBoardReplyAction } from "@/features/boards/actions/board.actions";
import { DEFAULT_BOARD_AUTHOR } from "@/features/boards/constants";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import type { BoardReplyInput } from "@/features/boards/types/board-form.types";

const INITIAL_FORM: BoardReplyInput = {
  content: "",
  authorName: DEFAULT_BOARD_AUTHOR,
  attachmentFileName: "",
  attachmentFileUrl: "",
};

type BoardReplyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  onSuccess?: (message: string) => void;
};

export function BoardReplyModal({
  open,
  onOpenChange,
  postId,
  onSuccess,
}: BoardReplyModalProps) {
  const [form, setForm] = useState<BoardReplyInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof BoardReplyInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof BoardReplyInput>(
    key: K,
    value: BoardReplyInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!postId) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await createBoardReplyAction(postId, form);

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
          error instanceof Error ? error.message : "답글 저장에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="답글 작성"
      description="게시글에 답글을 등록합니다."
      className="sm:max-w-lg"
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
          <AdminButton type="submit" form="board-reply-form" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form id="board-reply-form" className="space-y-4" onSubmit={handleSubmit}>
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {formError}
          </p>
        ) : null}

        <EnrollmentFormField
          label="내용"
          htmlFor="replyContent"
          required
          error={fieldErrors.content}
        >
          <EnrollmentFormTextarea
            id="replyContent"
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="작성자"
          htmlFor="replyAuthorName"
          required
          error={fieldErrors.authorName}
        >
          <AdminInput
            id="replyAuthorName"
            variant="outline"
            value={form.authorName}
            onChange={(event) => updateField("authorName", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="첨부파일명"
          htmlFor="replyAttachmentFileName"
          error={fieldErrors.attachmentFileName}
        >
          <AdminInput
            id="replyAttachmentFileName"
            variant="outline"
            value={form.attachmentFileName}
            onChange={(event) => updateField("attachmentFileName", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="첨부파일 URL"
          htmlFor="replyAttachmentFileUrl"
          error={fieldErrors.attachmentFileUrl}
        >
          <AdminInput
            id="replyAttachmentFileUrl"
            variant="outline"
            value={form.attachmentFileUrl}
            onChange={(event) => updateField("attachmentFileUrl", event.target.value)}
          />
        </EnrollmentFormField>
      </form>
    </AdminModal>
  );
}
