import Link from "next/link";
import { CheckCircle2, ListVideo, PlayCircle } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import {
  CLASSROOM_LECTURE_STATUS_BADGE_CLASS,
  CLASSROOM_LECTURE_STATUS_LABEL,
} from "@/features/classroom-lectures/constants";
import type { ClassroomLectureSession } from "@/features/classroom-lectures/types/classroom-lecture.types";
import { cn } from "@/lib/utils";

/**
 * 플레이어 화면 하단의 차시 목록 패널.
 * 별도 차시 목록 페이지를 거치지 않고 이 패널에서 바로 다른 차시로 이동합니다.
 */
export function LectureCurriculumPanel({
  slug,
  sessions,
  currentOrder,
}: {
  slug: string;
  sessions: ClassroomLectureSession[];
  currentOrder: number;
}) {
  const completedCount = sessions.filter((session) => session.status === "completed").length;

  return (
    <section
      className={cn("mt-6 overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4"
        style={{ borderColor: figma.colors.border }}
      >
        <h3 className={cn("flex items-center gap-2 text-[15px] font-bold", figmaClass.textPrimary)}>
          <ListVideo className="size-4.5" style={{ color: figma.colors.primary }} />
          차시 목록
        </h3>
        <span className={cn("text-[12.5px] font-semibold", figmaClass.textSub)}>
          {completedCount} / {sessions.length} 차시 완료
        </span>
      </div>

      <ol className="max-h-[420px] divide-y overflow-y-auto" style={{ borderColor: figma.colors.border }}>
        {sessions.map((session) => {
          const isCurrent = session.order === currentOrder;

          return (
            <li key={session.id}>
              <Link
                href={`/classroom/${slug}/lecture/${session.order}`}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5 transition-colors",
                  isCurrent ? "bg-[#f0f6ff]" : "hover:bg-[#f8fafc]",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                    isCurrent ? "text-white" : "bg-[#f1f3f5] text-[#6B7280]",
                  )}
                  style={isCurrent ? { backgroundColor: figma.colors.primary } : undefined}
                >
                  {session.order}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[13.5px]",
                      isCurrent ? "font-bold" : "font-medium",
                      figmaClass.textPrimary,
                    )}
                  >
                    {session.title}
                  </span>
                  <span className={cn("mt-0.5 block text-[12px]", figmaClass.textPlaceholder)}>
                    {session.durationMinutes != null ? `${session.durationMinutes}분` : "시간 안내 예정"}
                    {isCurrent ? " · 지금 학습 중" : ""}
                  </span>
                </span>

                {session.status === "completed" ? (
                  <CheckCircle2 className="size-4.5 shrink-0 text-[#1a7d3c]" />
                ) : isCurrent ? (
                  <PlayCircle className="size-4.5 shrink-0" style={{ color: figma.colors.primary }} />
                ) : (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                      CLASSROOM_LECTURE_STATUS_BADGE_CLASS[session.status],
                    )}
                  >
                    {CLASSROOM_LECTURE_STATUS_LABEL[session.status]}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
