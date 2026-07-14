"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { getMessageDispatchDetailAction } from "@/features/others/message-center/actions/message-dispatch.actions";
import { MessageSendStatusBadge } from "@/features/others/message-center/components/message-send-status-badge";
import {
  formatOptionalText,
  formatRecipientLabel,
  getMessageChannelLabel,
  getMessageDispatchTypeLabel,
} from "@/features/others/message-center/lib/message-dispatch.utils";
import type { MessageDispatchDetail } from "@/features/others/message-center/types/message-dispatch.types";
import { formatDateTime } from "@/lib/shared/format-date";

type MessageDispatchDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: string | null;
};

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

export function MessageDispatchDetailModal({
  open,
  onOpenChange,
  dispatchId,
}: MessageDispatchDetailModalProps) {
  const [detail, setDetail] = useState<MessageDispatchDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();

  useEffect(() => {
    if (!open || !dispatchId) {
      return;
    }

    startLoad(async () => {
      setDetail(null);
      setErrorMessage(null);

      try {
        const result = await getMessageDispatchDetailAction(dispatchId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        setDetail(result.dispatch);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "발송 내역을 불러오지 못했습니다.",
        );
      }
    });
  }, [open, dispatchId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setDetail(null);
      setErrorMessage(null);
    }
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="발송상태 조회"
      description="발송 내역 상세 정보를 조회합니다. (실발송 API 미연동)"
      className="sm:max-w-3xl"
      footer={
        <AdminButton type="button" variant="outline" onClick={() => handleOpenChange(false)}>
          닫기
        </AdminButton>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : errorMessage ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : detail ? (
        <div className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label="채널" value={getMessageChannelLabel(detail.channel)} />
            <DetailField
              label="발송유형"
              value={getMessageDispatchTypeLabel(detail.dispatchType)}
            />
            <DetailField
              label="발송상태"
              value={<MessageSendStatusBadge status={detail.status} />}
            />
            <DetailField label="발송자" value={detail.senderName} />
            <div className="sm:col-span-2">
              <DetailField
                label="수신자/대상"
                value={formatRecipientLabel(
                  detail.recipientName,
                  detail.recipientPhone,
                  detail.bulkSummary,
                  detail.recipientCount,
                )}
              />
            </div>
            <DetailField label="제목" value={formatOptionalText(detail.title)} />
            <DetailField
              label="성공/실패"
              value={`${detail.successCount} / ${detail.failCount}`}
            />
            <DetailField
              label="예약시각"
              value={detail.scheduledAt ? formatDateTime(detail.scheduledAt) : "—"}
            />
            <DetailField
              label="발송시각"
              value={detail.sentAt ? formatDateTime(detail.sentAt) : "—"}
            />
            <div className="sm:col-span-2">
              <DetailField label="메모" value={formatOptionalText(detail.memo)} />
            </div>
          </dl>
          <div>
            <h4 className="text-sm font-semibold text-[#111827]">메시지 내용</h4>
            <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151]">
              {detail.content}
            </p>
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}
