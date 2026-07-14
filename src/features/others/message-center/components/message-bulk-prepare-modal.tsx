"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { createMessageBulkPrepareAction } from "@/features/others/message-center/actions/message-dispatch.actions";
import {
  MESSAGE_CHANNEL_FORM_OPTIONS,
  MESSAGE_CHANNEL_LABELS,
} from "@/features/others/message-center/constants";
import { DEFAULT_MESSAGE_SENDER } from "@/features/others/constants";
import type { MessageBulkPrepareInput } from "@/features/others/message-center/types/message-form.types";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import type { MessageChannel } from "@/types/database.types";

const selectClassName =
  "h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

const INITIAL_FORM: MessageBulkPrepareInput = {
  channel: "sms",
  bulkSummary: "",
  recipientCount: 0,
  title: "",
  content: "",
  scheduledAt: "",
  senderName: DEFAULT_MESSAGE_SENDER,
  memo: "",
};

type MessageBulkPrepareModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
};

export function MessageBulkPrepareModal({
  open,
  onOpenChange,
  onSuccess,
}: MessageBulkPrepareModalProps) {
  const [form, setForm] = useState<MessageBulkPrepareInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MessageBulkPrepareInput, string>>
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

  function updateField<K extends keyof MessageBulkPrepareInput>(
    key: K,
    value: MessageBulkPrepareInput[K],
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
        const result = await createMessageBulkPrepareAction(form);

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
          error instanceof Error ? error.message : "대량발송 준비 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="대량발송 준비"
      description="대량발송 준비 내역을 등록합니다. (실발송 API 미연동)"
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
          <AdminButton type="submit" form="message-bulk-prepare-form" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록"}
          </AdminButton>
        </>
      }
    >
      <form id="message-bulk-prepare-form" className="space-y-4" onSubmit={handleSubmit}>
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{formError}</p>
        ) : null}

        <EnrollmentFormField label="채널" htmlFor="bulkChannel" required>
          <select
            id="bulkChannel"
            value={form.channel}
            onChange={(event) =>
              updateField("channel", event.target.value as MessageChannel)
            }
            className={selectClassName}
          >
            {MESSAGE_CHANNEL_FORM_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {MESSAGE_CHANNEL_LABELS[value]}
              </option>
            ))}
          </select>
        </EnrollmentFormField>

        <EnrollmentFormField
          label="발송 대상"
          htmlFor="bulkSummary"
          required
          error={fieldErrors.bulkSummary}
        >
          <AdminInput
            id="bulkSummary"
            variant="outline"
            value={form.bulkSummary}
            placeholder="예: 전체 활성 회원"
            onChange={(event) => updateField("bulkSummary", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="수신자 수"
          htmlFor="recipientCount"
          required
          error={fieldErrors.recipientCount}
        >
          <AdminInput
            id="recipientCount"
            type="number"
            min={1}
            variant="outline"
            value={form.recipientCount || ""}
            onChange={(event) =>
              updateField("recipientCount", Number(event.target.value))
            }
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="제목" htmlFor="bulkTitle" error={fieldErrors.title}>
          <AdminInput
            id="bulkTitle"
            variant="outline"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="내용"
          htmlFor="bulkContent"
          required
          error={fieldErrors.content}
        >
          <EnrollmentFormTextarea
            id="bulkContent"
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="발송예약" htmlFor="bulkScheduledAt">
          <AdminInput
            id="bulkScheduledAt"
            type="datetime-local"
            variant="outline"
            value={form.scheduledAt}
            onChange={(event) => updateField("scheduledAt", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="발송자"
          htmlFor="bulkSenderName"
          required
          error={fieldErrors.senderName}
        >
          <AdminInput
            id="bulkSenderName"
            variant="outline"
            value={form.senderName}
            onChange={(event) => updateField("senderName", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="메모" htmlFor="bulkMemo" error={fieldErrors.memo}>
          <AdminInput
            id="bulkMemo"
            variant="outline"
            value={form.memo}
            onChange={(event) => updateField("memo", event.target.value)}
          />
        </EnrollmentFormField>
      </form>
    </AdminModal>
  );
}
