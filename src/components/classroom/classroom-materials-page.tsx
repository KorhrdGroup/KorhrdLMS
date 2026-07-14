import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { MaterialListBoard } from "@/components/classroom/MaterialListBoard";
import { figma, figmaClass } from "@/components/home/home-design";
import type { ClassroomMaterialList } from "@/features/classroom-materials/types/classroom-material.types";
import { cn } from "@/lib/utils";

/**
 * 학습강의실 학습자료실 목록 페이지.
 * `materialList`가 null이면 수강신청/승인 이력이 없는 과정이거나 존재하지
 * 않는 과정이므로 "존재하지 않는 과정" 안내를 표시합니다.
 */
export function ClassroomMaterialsPage({
  slug,
  materialList,
}: {
  slug: string;
  materialList: ClassroomMaterialList | null;
}) {
  if (!materialList) {
    return (
      <ClassroomCourseShell courseTitle="학습강의실" slug={slug} breadcrumbLabel="학습자료실">
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
      courseTitle={materialList.courseTitle}
      slug={slug}
      pageTitle="학습자료실"
      activeMenuId="materials"
    >
      <MaterialListBoard slug={slug} materials={materialList.materials} />
    </ClassroomCourseShell>
  );
}
