"use client";

import { Download, Printer } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import type { CompletionCertificateListItem } from "@/features/completion-certificates/types/completion-certificate.types";
import { formatDate } from "@/lib/shared/format-date";

const INSTITUTION_NAME = "한평생직업훈련센터";

type CompletionCertificatePreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CompletionCertificateListItem | null;
};

function CertificateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-[#EEEEEE] pb-3">
      <span className="w-20 shrink-0 text-[13px] font-semibold text-[#9CA3AF]">{label}</span>
      <span className="text-[16px] font-bold text-[#111827]">{value}</span>
    </div>
  );
}

export function CompletionCertificatePreviewModal({
  open,
  onOpenChange,
  item,
}: CompletionCertificatePreviewModalProps) {
  if (!item || item.issuanceStatus !== "issued" || !item.certificateNumber || !item.issuedAt) {
    return (
      <AdminModal open={open} onOpenChange={onOpenChange} title="PDF 미리보기">
        <p className="text-sm text-[#6B7280]">발급된 수료증이 없습니다. 먼저 발급해주세요.</p>
      </AdminModal>
    );
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={onOpenChange}
      title="PDF 미리보기 (Mock)"
      description={`${item.member.name} 회원의 ${item.course.name} 과정 수료증입니다.`}
      className="sm:max-w-2xl"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <AdminButton type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            인쇄
          </AdminButton>
          <AdminButton
            type="button"
            onClick={() => window.alert("Mock PDF 다운로드입니다.")}
          >
            <Download className="size-4" />
            PDF 다운로드(Mock)
          </AdminButton>
        </div>
      }
    >
      <div className="mx-auto max-w-[560px] border-[3px] border-[#3B82F6] bg-white p-8 sm:p-10">
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.35em] text-[#3B82F6]">
            CERTIFICATE OF COMPLETION
          </p>
          <h2 className="mt-3 text-[26px] font-black tracking-[0.5em] text-[#3B82F6]">수료증</h2>
        </div>

        <div className="mx-auto mt-8 flex max-w-[380px] flex-col gap-3 text-[14px]">
          <CertificateRow label="과정명" value={item.course.name} />
          <CertificateRow label="수강생" value={item.member.name} />
          <CertificateRow label="수료일" value={formatDate(item.completionDate)} />
          <CertificateRow label="수료번호" value={item.certificateNumber} />
        </div>

        <p className="mx-auto mt-8 max-w-[440px] text-center text-[13px] leading-[1.9] text-[#374151]">
          위 사람은 본원이 실시한 <strong>{item.course.name}</strong> 과정의 소정 교육과정을 이수
          기준에 따라 성실히 이수하였으므로 이 증서를 수여합니다.
        </p>

        <div className="mt-10 flex flex-col items-center gap-1.5">
          <p className="text-[12px] text-[#9CA3AF]">{formatDate(item.issuedAt)}</p>
          <p className="text-[18px] font-bold text-[#3B82F6]">{INSTITUTION_NAME}</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#9CA3AF]">
        재발급 {item.reissueCount}회 · 발급일 {formatDate(item.issuedAt)}
      </p>
    </AdminModal>
  );
}
