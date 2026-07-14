"use client";

import { FileUp, Paperclip } from "lucide-react";

import { formatFileSizeLabel } from "@/features/notice-management/constants";
import type { NoticeAttachmentInput } from "@/features/notice-management/types/notice.types";
import { cn } from "@/lib/utils";

type NoticeAttachmentPickerProps = {
  value: NoticeAttachmentInput | null;
  existingFileName?: string;
  onChange: (attachment: NoticeAttachmentInput) => void;
  className?: string;
};

/**
 * 실제 업로드/저장 없이 브라우저 파일 선택 다이얼로그에서 고른 파일의
 * 이름·용량만 캡처하는 Mock 첨부파일 컴포넌트입니다.
 * 추후 Supabase Storage 연동 시, onChange에서 실제 업로드 로직을 호출하고
 * 반환된 경로를 fileName 대신 저장하도록 교체하면 됩니다.
 */
export function NoticeAttachmentPicker({
  value,
  existingFileName,
  onChange,
  className,
}: NoticeAttachmentPickerProps) {
  const displayName = value?.fileName ?? existingFileName ?? "";

  return (
    <label
      className={cn(
        "flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB]",
        className,
      )}
    >
      {displayName ? (
        <Paperclip className="size-4 shrink-0 text-[#9CA3AF]" />
      ) : (
        <FileUp className="size-4 shrink-0 text-[#9CA3AF]" />
      )}
      <span className="flex-1 truncate">
        {displayName || "첨부파일 선택 (선택, Mock)"}
      </span>
      {value ? (
        <span className="shrink-0 text-xs text-[#9CA3AF]">{value.fileSizeLabel}</span>
      ) : null}
      <input
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          onChange({
            fileName: file.name,
            fileSizeLabel: formatFileSizeLabel(file.size),
          });
        }}
      />
    </label>
  );
}
