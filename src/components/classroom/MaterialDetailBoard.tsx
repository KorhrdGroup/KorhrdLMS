"use client";

import Link from "next/link";
import { Paperclip } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import type { ClassroomMaterialItem } from "@/features/classroom-materials/types/classroom-material.types";
import { cn } from "@/lib/utils";

export function MaterialDetailBoard({
  slug,
  material,
}: {
  slug: string;
  material: ClassroomMaterialItem | null;
}) {
  if (!material) {
    return (
      <div className="min-w-0 flex-1">
        <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>학습자료실</h2>
        <div
          className={cn(
            "flex flex-col items-center gap-3 border px-6 py-20 text-center",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
          )}
        >
          <p className={cn("text-[14px]", figmaClass.textPlaceholder)}>존재하지 않는 게시물입니다.</p>
          <Link
            href={`/classroom/${slug}/materials`}
            className="flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
            style={{ borderColor: figma.colors.border }}
          >
            목록
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>학습자료실</h2>

      <div className={cn("border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <div className="border-b px-6 py-5 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <div className="flex flex-wrap items-center gap-2">
            {material.isCommon ? (
              <span className="shrink-0 rounded bg-[#e5edff] px-1.5 py-0.5 text-[11px] font-semibold text-[#00376e]">
                공통
              </span>
            ) : null}
            <h3 className={cn("text-[19px] font-bold sm:text-[21px]", figmaClass.textPrimary)}>{material.title}</h3>
          </div>
          <p className={cn("mt-2 text-[13px]", figmaClass.textPlaceholder)}>
            작성자 {material.createdBy} · 등록일 {material.createdAt}
          </p>
        </div>

        <div className="border-b px-6 py-8 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <p className={cn("text-[14px] leading-[1.8] whitespace-pre-line", figmaClass.textBody)}>
            {material.content}
          </p>
        </div>

        {material.fileName ? (
          <div className="px-6 py-6 sm:px-8">
            <p className={cn("mb-2 text-[13px] font-semibold", figmaClass.textSub)}>첨부파일</p>
            {material.fileUrl ? (
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-left text-[13px] transition-colors duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e] sm:w-auto",
                  figmaClass.textBody,
                  figmaClass.borderDefault,
                )}
              >
                <Paperclip className="size-4 shrink-0" style={{ color: figma.colors.primary }} />
                {material.fileName}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => window.alert("다운로드 링크가 아직 등록되지 않았습니다.")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-left text-[13px] transition-colors duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e] sm:w-auto",
                  figmaClass.textBody,
                  figmaClass.borderDefault,
                )}
              >
                <Paperclip className="size-4 shrink-0" style={{ color: figma.colors.primary }} />
                {material.fileName}
              </button>
            )}
          </div>
        ) : null}

        <div className="flex justify-end border-t px-6 py-5 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <Link
            href={`/classroom/${slug}/materials`}
            className={cn(
              "flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
              figmaClass.textSub,
              figmaClass.borderDefault,
            )}
          >
            목록
          </Link>
        </div>
      </div>
    </div>
  );
}
