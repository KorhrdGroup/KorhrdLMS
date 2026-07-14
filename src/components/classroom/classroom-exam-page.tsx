import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { ExamListBoard } from "@/components/classroom/ExamListBoard";
import { figma, figmaClass } from "@/components/home/home-design";
import type { ClassroomExamList } from "@/features/classroom-exams/types/classroom-exam.types";
import { cn } from "@/lib/utils";

/**
 * 학습강의실 시험 페이지 — 관리자 시험관리에서 공개(is_published)한 시험만
 * 표시합니다. 응시 자격(진도율)은 서버(getClassroomCourseExams)에서 계산해
 * 각 시험의 status로 내려줍니다.
 */
export function ClassroomExamPage({
  slug,
  examList,
}: {
  slug: string;
  examList: ClassroomExamList | null;
}) {
  if (!examList) {
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
      courseTitle={examList.courseTitle}
      slug={slug}
      pageTitle={`${examList.courseTitle} 시험`}
      activeMenuId="exam"
    >
      <ExamListBoard slug={slug} examList={examList} />
    </ClassroomCourseShell>
  );
}
