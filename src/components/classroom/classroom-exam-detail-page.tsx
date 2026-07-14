import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { ExamTakingBoard } from "@/components/classroom/ExamTakingBoard";
import { figma, figmaClass } from "@/components/home/home-design";
import type { GetClassroomExamTakingResult } from "@/features/classroom-exams/types/classroom-exam.types";
import { cn } from "@/lib/utils";

/**
 * 학습강의실 시험 응시 화면 — 관리자 시험관리에서 등록한 문제를 순서대로
 * 표시합니다. 제출 결과는 Supabase `exam_submissions` 테이블에 저장됩니다.
 */
export function ClassroomExamDetailPage({
  slug,
  examId,
  result,
}: {
  slug: string;
  examId: string;
  result: GetClassroomExamTakingResult;
}) {
  if (!result.success) {
    return (
      <ClassroomCourseShell courseTitle="학습강의실" slug={slug} breadcrumbLabel="시험">
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
          <p className={cn("text-[16px] font-semibold", figmaClass.textPrimary)}>{result.message}</p>
          <Link
            href={`/classroom/${slug}/exam`}
            className="mt-2 flex h-10 items-center justify-center rounded-lg border px-5 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]"
            style={{ borderColor: figma.colors.border }}
          >
            시험목록으로 돌아가기
          </Link>
        </div>
      </ClassroomCourseShell>
    );
  }

  const { exam } = result;

  return (
    <ClassroomCourseShell courseTitle={exam.title} slug={slug} pageTitle={exam.title} activeMenuId="exam">
      <ExamTakingBoard slug={slug} examId={examId} exam={exam} />
    </ClassroomCourseShell>
  );
}
