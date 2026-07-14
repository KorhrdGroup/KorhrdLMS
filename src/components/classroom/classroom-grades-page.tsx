import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { GradesBoard } from "@/components/classroom/GradesBoard";
import { figma, figmaClass } from "@/components/home/home-design";
import type { ClassroomGradeData } from "@/features/classroom-grades/types/classroom-grade.types";
import { cn } from "@/lib/utils";

/**
 * 학습강의실 성적보기 페이지 — 로그인한 학생 본인의 진도율/시험점수/합격여부/
 * 수료가능여부를 Supabase 실제 데이터 기준으로 표시합니다.
 */
export function ClassroomGradesPage({ slug, data }: { slug: string; data: ClassroomGradeData | null }) {
  if (!data) {
    return (
      <ClassroomCourseShell courseTitle="학습강의실" slug={slug} breadcrumbLabel="성적">
        <div
          className={cn(
            "flex flex-col items-center gap-4 border px-6 py-24 text-center",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
            figmaClass.whiteBg,
          )}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-[#e5edff]">
            <AlertCircle className="size-6" style={{ color: figma.colors.primary }} />
          </div>
          <p className={cn("text-[16px] font-semibold", figmaClass.textPrimary)}>존재하지 않는 과정입니다.</p>
          <Link
            href="/classroom"
            className="mt-2 flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
            style={{ borderColor: figma.colors.border }}
          >
            학습강의실로 돌아가기
          </Link>
        </div>
      </ClassroomCourseShell>
    );
  }

  return (
    <ClassroomCourseShell
      courseTitle={data.summary.subjectName}
      slug={slug}
      pageTitle={`${data.summary.subjectName} 성적`}
      activeMenuId="grades"
    >
      <GradesBoard data={data} />
    </ClassroomCourseShell>
  );
}
