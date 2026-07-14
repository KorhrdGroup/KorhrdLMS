"use client";

import { useRef, useState } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { CourseFormField } from "@/features/courses/components/course-form-field";
import { uploadCourseThumbnailFile } from "@/features/courses/lib/course-thumbnail-upload.client";

type CourseThumbnailFieldProps = {
  idPrefix: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
};

/** 과정등록/과정수정 공통 "썸네일 이미지" 업로드 필드. Supabase Storage에 업로드 후 공개 URL을 저장합니다. */
export function CourseThumbnailField({
  idPrefix,
  value,
  onChange,
  error,
}: CourseThumbnailFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const url = await uploadCourseThumbnailFile(file);
      onChange(url);
    } catch (uploadErr) {
      setUploadError(
        uploadErr instanceof Error
          ? uploadErr.message
          : "썸네일 이미지 업로드에 실패했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <CourseFormField
      label="썸네일 이미지"
      htmlFor={`${idPrefix}-thumbnail`}
      error={error ?? uploadError ?? undefined}
      hint="학생 수강신청 과정 카드 왼쪽에 노출됩니다. 미등록 시 기본 이미지가 표시됩니다."
      className="sm:col-span-2"
    >
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="썸네일 미리보기"
            className="size-16 shrink-0 rounded-lg border border-[#E5E7EB] object-cover"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] text-[10px] text-[#9CA3AF]">
            미리보기
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            id={`${idPrefix}-thumbnail`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <AdminButton
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? "업로드 중..." : "이미지 선택"}
          </AdminButton>
          {value ? (
            <AdminButton
              type="button"
              variant="ghost"
              disabled={isUploading}
              onClick={() => onChange("")}
            >
              제거
            </AdminButton>
          ) : null}
        </div>
      </div>
    </CourseFormField>
  );
}
