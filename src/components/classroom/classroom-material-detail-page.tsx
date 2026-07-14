import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ClassroomCourseShell } from "@/components/classroom/ClassroomCourseShell";
import { MaterialDetailBoard } from "@/components/classroom/MaterialDetailBoard";
import { figma, figmaClass } from "@/components/home/home-design";
import type { ClassroomMaterialDetailResult } from "@/features/classroom-materials/types/classroom-material.types";
import { cn } from "@/lib/utils";

export function ClassroomMaterialDetailPage({
  slug,
  result,
}: {
  slug: string;
  result: ClassroomMaterialDetailResult;
}) {
  if (!result.success) {
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
      courseTitle={result.courseTitle}
      slug={slug}
      pageTitle="학습자료실"
      activeMenuId="materials"
    >
      <MaterialDetailBoard slug={slug} material={result.material} />
    </ClassroomCourseShell>
  );
}
