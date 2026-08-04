"use client";

import { useRef, useState } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { CourseFormField } from "@/features/courses/components/course-form-field";
import { uploadProfessorPhotoAction } from "@/features/professors/actions/professor.actions";

type ProfessorPhotoFieldProps = {
  value: string;
  onChange: (url: string) => void;
  /** 업로드 파일명을 교수명 기반으로 만들기 위해 전달합니다. */
  professorName?: string;
  error?: string;
};

/**
 * 교수 사진 업로드 필드. 강의 영상과 같은 Cloudflare R2 버킷에 올립니다.
 * R2는 브라우저에서 직접 올릴 수 없어 서버 액션을 거칩니다.
 * 상세페이지 교수 소개에 150x150으로 노출됩니다.
 */
export function ProfessorPhotoField({
  value,
  onChange,
  professorName,
  error,
}: ProfessorPhotoFieldProps) {
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", professorName ?? "");

      const result = await uploadProfessorPhotoAction(formData);
      if (result.success) {
        onChange(result.url);
      } else {
        setUploadError(result.message);
      }
    } catch (uploadErr) {
      setUploadError(
        uploadErr instanceof Error ? uploadErr.message : "사진 업로드에 실패했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <CourseFormField
      label="교수 사진"
      htmlFor="professor-photo"
      error={error ?? uploadError ?? undefined}
      hint="상세페이지 교수 소개에 노출됩니다(권장 150x150). 미등록 시 기본 이미지가 표시됩니다."
    >
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="교수 사진 미리보기"
            className="size-16 shrink-0 rounded-full border border-[#E5E7EB] object-cover"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-dashed border-[#E5E7EB] text-[10px] text-[#9CA3AF]">
            미리보기
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            id="professor-photo"
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
            {isUploading ? "업로드 중..." : "사진 선택"}
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
