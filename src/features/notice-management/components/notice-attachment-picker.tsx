"use client";

import { FileUp, Paperclip } from "lucide-react";
import { useState } from "react";

import { formatFileSizeLabel } from "@/features/notice-management/constants";
import { uploadNoticeAttachment } from "@/features/notice-management/lib/notice-attachment-upload.client";
import type { NoticeAttachmentInput } from "@/features/notice-management/types/notice.types";
import { cn } from "@/lib/utils";

type NoticeAttachmentPickerProps = {
  value: NoticeAttachmentInput | null;
  existingFileName?: string;
  onChange: (attachment: NoticeAttachmentInput) => void;
  className?: string;
};

/**
 * 선택한 파일을 Supabase Storage(notice-attachments)에 실제로 업로드하고,
 * 저장에 필요한 파일명·용량·공개 URL·경로를 상위로 전달합니다.
 */
export function NoticeAttachmentPicker({
  value,
  existingFileName,
  onChange,
  className,
}: NoticeAttachmentPickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = value?.fileName ?? existingFileName ?? "";

  async function handleSelect(file: File | null) {
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const { url, path } = await uploadNoticeAttachment(file);
      onChange({
        fileName: file.name,
        fileSizeLabel: formatFileSizeLabel(file.size),
        fileUrl: url,
        storagePath: path,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "첨부파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280] transition-colors",
          isUploading ? "cursor-wait opacity-70" : "cursor-pointer hover:bg-[#F9FAFB]",
        )}
      >
        {displayName ? (
          <Paperclip className="size-4 shrink-0 text-[#9CA3AF]" />
        ) : (
          <FileUp className="size-4 shrink-0 text-[#9CA3AF]" />
        )}
        <span className="flex-1 truncate">
          {isUploading ? "업로드 중..." : displayName || "첨부파일 선택 (선택)"}
        </span>
        {value?.fileSizeLabel ? (
          <span className="shrink-0 text-xs text-[#9CA3AF]">{value.fileSizeLabel}</span>
        ) : null}
        <input
          type="file"
          className="hidden"
          disabled={isUploading}
          onChange={(event) => handleSelect(event.target.files?.[0] ?? null)}
        />
      </label>

      {error ? <p className="text-xs text-[#EF4444]">{error}</p> : null}
    </div>
  );
}
