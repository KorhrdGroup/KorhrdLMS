"use client";

import Link from "next/link";
import { Paperclip, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

import type { CourseAssignment } from "@/components/classroom/data/assignment-data";
import { figma, figmaClass } from "@/components/home/home-design";
import {
  getAssignmentSubmission,
  submitAssignment,
  type AssignmentSubmissionRecord,
} from "@/lib/classroom/assignment-submission-store";
import { cn } from "@/lib/utils";

function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AssignmentDetailBoard({ slug, assignment }: { slug: string; assignment: CourseAssignment }) {
  const [submission, setSubmission] = useState<AssignmentSubmissionRecord | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    setSubmission(getAssignmentSubmission(slug, assignment.id));
  }, [slug, assignment.id]);

  if (submission === undefined) {
    return <div className="min-w-0 flex-1" />;
  }

  const submitted = submission?.status === "submitted" && !editing;

  const handleSubmit = () => {
    if (!content.trim()) {
      window.alert("과제 내용을 입력해주세요.");
      return;
    }
    const record = submitAssignment(slug, assignment.id, { content: content.trim(), fileName });
    setSubmission(record);
    setEditing(false);
    window.alert("과제가 제출되었습니다.");
  };

  const startEditing = () => {
    setContent(submission?.content ?? "");
    setFileName(submission?.fileName ?? null);
    setEditing(true);
  };

  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>과제</h2>

      <div className={cn("border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <div className="border-b px-6 py-5 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("text-[19px] font-bold sm:text-[21px]", figmaClass.textPrimary)}>{assignment.title}</h3>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                submitted ? "bg-[#e5edff] text-[#00376e]" : "border border-[#e5433f]/30 bg-[#e5433f]/5 text-[#e5433f]",
              )}
            >
              {submitted ? "제출완료" : "미제출"}
            </span>
          </div>
          <p className={cn("mt-2 text-[13px]", figmaClass.textPlaceholder)}>제출기간 {assignment.periodLabel}</p>
        </div>

        <div className="border-b px-6 py-8 sm:px-8" style={{ borderColor: figma.colors.border }}>
          <p className={cn("text-[14px] leading-[1.8] whitespace-pre-line", figmaClass.textBody)}>
            {assignment.description}
          </p>

          {assignment.attachmentFileName ? (
            <div className="mt-5">
              <p className={cn("mb-2 text-[13px] font-semibold", figmaClass.textSub)}>첨부파일</p>
              <button
                type="button"
                onClick={() => window.alert("Mock 다운로드입니다.")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-left text-[13px] transition-colors duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e] sm:w-auto",
                  figmaClass.textBody,
                  figmaClass.borderDefault,
                )}
              >
                <Paperclip className="size-4 shrink-0" style={{ color: figma.colors.primary }} />
                {assignment.attachmentFileName}
              </button>
            </div>
          ) : null}
        </div>

        {submitted && submission ? (
          <div className="px-6 py-6 sm:px-8">
            <p className={cn("mb-2 text-[13px] font-bold", figmaClass.textPrimary)}>제출한 내용</p>
            <div className="rounded-lg bg-[#f4f8ff] px-5 py-5">
              <p className={cn("text-[14px] leading-[1.8] whitespace-pre-line", figmaClass.textBody)}>
                {submission.content}
              </p>
              {submission.fileName ? (
                <p className={cn("mt-3 flex items-center gap-1.5 text-[12.5px]", figmaClass.textSub)}>
                  <Paperclip className="size-3.5" /> {submission.fileName}
                </p>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className={cn("text-[12px]", figmaClass.textPlaceholder)}>
                제출일시 {formatSubmittedAt(submission.submittedAt)}
                {submission.score !== null ? ` · 점수 ${submission.score}점` : ""}
              </p>
              <button
                type="button"
                onClick={startEditing}
                className="text-[12.5px] font-semibold underline decoration-dotted"
                style={{ color: figma.colors.primary }}
              >
                다시 제출하기
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 sm:px-8">
            <p className={cn("mb-2 text-[13px] font-bold", figmaClass.textPrimary)}>과제 제출</p>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="과제 내용을 입력해주세요."
              rows={6}
              className={cn(
                "w-full resize-none rounded-lg border px-4 py-3 text-[13.5px] outline-none transition-colors duration-200 focus:border-[#00376e]",
                figmaClass.borderDefault,
              )}
            />

            <div className="mt-3">
              <label
                className={cn(
                  "flex h-11 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 text-[13px] font-semibold transition-colors duration-200 hover:bg-[#f4f8ff]",
                  figmaClass.textSub,
                  figmaClass.borderDefault,
                )}
              >
                <UploadCloud className="size-4" />
                {fileName ?? "파일 첨부 (선택)"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
                />
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-5 sm:px-8" style={{ borderColor: figma.colors.border }}>
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex h-10 items-center justify-center rounded-lg px-6 text-[13px] font-bold text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: figma.colors.primary }}
            >
              제출하기
            </button>
          ) : null}
          <Link
            href={`/classroom/${slug}/assignments`}
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
