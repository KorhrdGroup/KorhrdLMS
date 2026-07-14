"use client";

import Link from "next/link";
import { ClipboardEdit, Info } from "lucide-react";
import { useEffect, useState } from "react";

import { getAssignmentStatusLabel, type CourseAssignment } from "@/components/classroom/data/assignment-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { getAssignmentsWithStatus } from "@/lib/classroom/assignment-submission-store";
import { cn } from "@/lib/utils";

const NOTICE_ITEMS = [
  "과제는 제출기간 내에만 제출할 수 있으며, 기간이 지나면 제출이 제한됩니다.",
  "제출한 과제는 담당 강사 확인 후 성적보기 화면에 반영됩니다.",
  "동일한 과제는 다시 제출하면 이전 제출 내용을 덮어씁니다.",
];

export function AssignmentListBoard({ slug, assignments: initialAssignments }: { slug: string; assignments: CourseAssignment[] }) {
  const [assignments, setAssignments] = useState(initialAssignments);

  // Overlay live Mock submission status (from localStorage) once mounted —
  // keeps the 제출완료 배지 in sync with whatever was last submitted on the
  // assignment detail page.
  useEffect(() => {
    setAssignments(getAssignmentsWithStatus(slug));
  }, [slug]);

  return (
    <div>
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>과제</h2>

      {assignments.length === 0 ? (
        <div
          className={cn(
            "flex items-center justify-center border px-6 py-16 text-center text-[14px]",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
            figmaClass.textPlaceholder,
          )}
        >
          출제된 과제가 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} slug={slug} assignment={assignment} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#f7f8fa] px-5 py-4">
        <Info className="mt-0.5 size-4 shrink-0 text-[#919191]" />
        <ul className={cn("space-y-1.5 text-[12.5px] leading-relaxed", figmaClass.textMuted)}>
          {NOTICE_ITEMS.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AssignmentCard({ slug, assignment }: { slug: string; assignment: CourseAssignment }) {
  const submitted = assignment.status === "submitted";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        figmaClass.roundedCard,
        figmaClass.borderDefault,
        figmaClass.whiteBg,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e5edff]">
          <ClipboardEdit className="size-5" style={{ color: figma.colors.primary }} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("text-[16px] font-bold", figmaClass.textPrimary)}>{assignment.title}</h3>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                submitted ? "bg-[#e5edff] text-[#00376e]" : "border border-[#e5433f]/30 bg-[#e5433f]/5 text-[#e5433f]",
              )}
            >
              {getAssignmentStatusLabel(assignment.status)}
            </span>
          </div>
          <p className={cn("mt-1.5 text-[13px]", figmaClass.textPlaceholder)}>{assignment.periodLabel}</p>
        </div>
      </div>

      <Link
        href={`/classroom/${slug}/assignments/${assignment.id}`}
        className="flex h-11 shrink-0 items-center justify-center rounded-lg px-6 text-[14px] font-bold text-white transition-all duration-200 hover:brightness-110"
        style={{ backgroundColor: figma.colors.primary }}
      >
        {submitted ? "제출내용 확인" : "과제 제출하기"}
      </Link>
    </div>
  );
}
