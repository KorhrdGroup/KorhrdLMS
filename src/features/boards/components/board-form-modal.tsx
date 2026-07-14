"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createBoardPostAction,
  getBoardPostForEditAction,
  updateBoardPostAction,
} from "@/features/boards/actions/board.actions";
import { DEFAULT_BOARD_AUTHOR } from "@/features/boards/constants";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import type { BoardPostInput } from "@/features/boards/types/board-form.types";
import type { BoardType } from "@/types/database.types";

const INITIAL_FORM: BoardPostInput = {
  title: "",
  content: "",
  authorName: DEFAULT_BOARD_AUTHOR,
  isNotice: false,
  attachmentFileName: "",
  attachmentFileUrl: "",
};

type BoardFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardType: BoardType;
  postId?: string | null;
  onSuccess?: (message: string) => void;
};

export function BoardFormModal({
  open,
  onOpenChange,
  boardType,
  postId = null,
  onSuccess,
}: BoardFormModalProps) {
  const isEditMode = !!postId;
  const [form, setForm] = useState<BoardPostInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof BoardPostInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!postId) {
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
        const result = await getBoardPostForEditAction(postId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(result.post);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "게시글 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, postId]);

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

  function updateField<K extends keyof BoardPostInput>(
    key: K,
    value: BoardPostInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  const canSubmit = !isSubmitting && !isLoading && (!isEditMode || !!form.title);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = isEditMode
          ? await updateBoardPostAction(postId!, form)
          : await createBoardPostAction(boardType, form);

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
          error instanceof Error ? error.message : "게시글 저장에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "게시글 수정" : "게시글 등록"}
      description={
        isEditMode ? "게시글 정보를 수정할 수 있습니다." : "새 게시글을 등록합니다."
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
            form="board-post-form"
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
      ) : formError && isEditMode && !form.title ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {formError}
        </div>
      ) : (
        <form id="board-post-form" className="space-y-4" onSubmit={handleSubmit}>
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <EnrollmentFormField
            label="제목"
            htmlFor="title"
            required
            error={fieldErrors.title}
          >
            <AdminInput
              id="title"
              variant="outline"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="내용"
            htmlFor="content"
            required
            error={fieldErrors.content}
          >
            <EnrollmentFormTextarea
              id="content"
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="작성자"
            htmlFor="authorName"
            required
            error={fieldErrors.authorName}
          >
            <AdminInput
              id="authorName"
              variant="outline"
              value={form.authorName}
              onChange={(event) => updateField("authorName", event.target.value)}
            />
          </EnrollmentFormField>

          <label className="flex items-center gap-2 text-sm text-[#374151]">
            <AdminCheckbox
              checked={form.isNotice}
              onChange={(event) => updateField("isNotice", event.target.checked)}
            />
            공지(상단고정)
          </label>

          <EnrollmentFormField
            label="첨부파일명"
            htmlFor="attachmentFileName"
            error={fieldErrors.attachmentFileName}
          >
            <AdminInput
              id="attachmentFileName"
              variant="outline"
              value={form.attachmentFileName}
              placeholder="example.pdf"
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
              placeholder="/files/example.pdf"
              onChange={(event) => updateField("attachmentFileUrl", event.target.value)}
            />
          </EnrollmentFormField>
        </form>
      )}
    </AdminModal>
  );
}
