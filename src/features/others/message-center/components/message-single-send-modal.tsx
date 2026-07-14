"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { createMessageSingleSendAction } from "@/features/others/message-center/actions/message-dispatch.actions";
import {
  MESSAGE_CHANNEL_FORM_OPTIONS,
  MESSAGE_CHANNEL_LABELS,
} from "@/features/others/message-center/constants";
import { DEFAULT_MESSAGE_SENDER } from "@/features/others/constants";
import type { MessageSingleSendInput } from "@/features/others/message-center/types/message-form.types";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import type { MessageChannel } from "@/types/database.types";

const selectClassName =
  "h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

const INITIAL_FORM: MessageSingleSendInput = {
  channel: "sms",
  recipientName: "",
  recipientPhone: "",
  title: "",
  content: "",
  scheduledAt: "",
  senderName: DEFAULT_MESSAGE_SENDER,
  memo: "",
};

type MessageSingleSendModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
};

export function MessageSingleSendModal({
  open,
  onOpenChange,
  onSuccess,
}: MessageSingleSendModalProps) {
  const [form, setForm] = useState<MessageSingleSendInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MessageSingleSendInput, string>>
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

  function updateField<K extends keyof MessageSingleSendInput>(
    key: K,
    value: MessageSingleSendInput[K],
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
        const result = await createMessageSingleSendAction(form);

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
          error instanceof Error ? error.message : "단건발송 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="단건발송"
      description="단건 메시지 발송 내역을 등록합니다. (실발송 API 미연동)"
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
          <AdminButton type="submit" form="message-single-send-form" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록"}
          </AdminButton>
        </>
      }
    >
      <form id="message-single-send-form" className="space-y-4" onSubmit={handleSubmit}>
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{formError}</p>
        ) : null}

        <EnrollmentFormField label="채널" htmlFor="singleChannel" required>
          <select
            id="singleChannel"
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
          label="수신자명"
          htmlFor="recipientName"
          required
          error={fieldErrors.recipientName}
        >
          <AdminInput
            id="recipientName"
            variant="outline"
            value={form.recipientName}
            onChange={(event) => updateField("recipientName", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="수신번호"
          htmlFor="recipientPhone"
          required
          error={fieldErrors.recipientPhone}
        >
          <AdminInput
            id="recipientPhone"
            variant="outline"
            value={form.recipientPhone}
            onChange={(event) => updateField("recipientPhone", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="제목" htmlFor="singleTitle" error={fieldErrors.title}>
          <AdminInput
            id="singleTitle"
            variant="outline"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="내용"
          htmlFor="singleContent"
          required
          error={fieldErrors.content}
        >
          <EnrollmentFormTextarea
            id="singleContent"
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="발송예약" htmlFor="singleScheduledAt">
          <AdminInput
            id="singleScheduledAt"
            type="datetime-local"
            variant="outline"
            value={form.scheduledAt}
            onChange={(event) => updateField("scheduledAt", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="발송자"
          htmlFor="singleSenderName"
          required
          error={fieldErrors.senderName}
        >
          <AdminInput
            id="singleSenderName"
            variant="outline"
            value={form.senderName}
            onChange={(event) => updateField("senderName", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="메모" htmlFor="singleMemo" error={fieldErrors.memo}>
          <AdminInput
            id="singleMemo"
            variant="outline"
            value={form.memo}
            onChange={(event) => updateField("memo", event.target.value)}
          />
        </EnrollmentFormField>
      </form>
    </AdminModal>
  );
}
