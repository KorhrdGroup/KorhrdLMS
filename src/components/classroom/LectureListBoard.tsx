import Link from "next/link";
import { BookOpen, ClipboardEdit, FileEdit } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import {
  CLASSROOM_LECTURE_STATUS_BADGE_CLASS,
  CLASSROOM_LECTURE_STATUS_LABEL,
} from "@/features/classroom-lectures/constants";
import type { ClassroomLectureSession } from "@/features/classroom-lectures/types/classroom-lecture.types";
import { cn } from "@/lib/utils";

const NOTICE_ITEMS = [
  "출석율은 총학습 차시에서 출석완료된 차시 합계를 환산한 것입니다.",
  "출석율 60% 이상과 성적 60점 이상, 두 조건을 충족하셔야 수료 가능합니다.",
  "총 6차시 이상 출석완료를 하지 못할 경우, 성적이 60점 이상이더라도 수료가 어렵습니다.",
];

export function LectureListBoard({
  slug,
  sessions,
}: {
  slug: string;
  sessions: ClassroomLectureSession[];
}) {
  const completedCount = sessions.filter((session) => session.status === "completed").length;
  const attendanceRate = sessions.length > 0 ? Math.round((completedCount / sessions.length) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <Link
          href={`/classroom/${slug}/materials`}
          className={cn(
            "flex h-10 items-center justify-center gap-1.5 rounded-lg border px-4 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
            figmaClass.textSub,
            figmaClass.borderDefault,
          )}
        >
          <BookOpen className="size-4" />
          학습자료실
        </Link>
        <Link
          href={`/classroom/${slug}/assignments`}
          className={cn(
            "flex h-10 items-center justify-center gap-1.5 rounded-lg border px-4 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
            figmaClass.textSub,
            figmaClass.borderDefault,
          )}
        >
          <ClipboardEdit className="size-4" />
          과제
        </Link>
        <Link
          href={`/classroom/${slug}/exam`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-[13px] font-bold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: figma.colors.primary }}
        >
          <FileEdit className="size-4" />
          시험보기
        </Link>
      </div>

      <p className={cn("mb-3 text-[13px]", figmaClass.textPlaceholder)}>* 차시명을 클릭하시면 수업을 시작합니다.</p>

      <div className={cn("overflow-x-auto border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <table className="w-full min-w-[560px] text-[13px]">
          <thead>
            <tr className="border-b bg-[#f7f8fa] text-center text-[13px] font-semibold text-[#3d3d3d]">
              <th className="w-[80px] border-r py-3" style={{ borderColor: figma.colors.border }}>
                차시번호
              </th>
              <th className="border-r py-3 pl-4 text-left" style={{ borderColor: figma.colors.border }}>
                강의명
              </th>
              <th className="w-[110px] border-r py-3" style={{ borderColor: figma.colors.border }}>
                학습시간
              </th>
              <th className="w-[110px] py-3">학습상태</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className={cn("py-16 text-center", figmaClass.textPlaceholder)}>
                  등록된 차시가 없습니다. 관리자가 강의를 등록하면 이곳에 표시됩니다.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b text-center last:border-0"
                  style={{ borderColor: figma.colors.border }}
                >
                  <td className={cn("border-r py-3", figmaClass.textPlaceholder)} style={{ borderColor: figma.colors.border }}>
                    {session.order}차시
                  </td>
                  <td className="border-r py-3 pl-4 text-left" style={{ borderColor: figma.colors.border }}>
                    <Link
                      href={`/classroom/${slug}/lecture/${session.order}`}
                      className={cn(
                        "transition-colors duration-200 hover:text-[#00376e] hover:underline",
                        figmaClass.textBody,
                      )}
                    >
                      {session.title}
                    </Link>
                  </td>
                  <td className={cn("border-r py-3", figmaClass.textPlaceholder)} style={{ borderColor: figma.colors.border }}>
                    {session.durationMinutes != null ? `${session.durationMinutes}분` : "안내 예정"}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold",
                        CLASSROOM_LECTURE_STATUS_BADGE_CLASS[session.status],
                      )}
                    >
                      {CLASSROOM_LECTURE_STATUS_LABEL[session.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        className={cn(
          "mt-6 flex items-center gap-4 border p-5",
          figmaClass.roundedCard,
          figmaClass.borderDefault,
          figmaClass.whiteBg,
        )}
      >
        <span className={cn("shrink-0 text-[14px] font-bold", figmaClass.textPrimary)}>전체출석율</span>
        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#eef0f3]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${attendanceRate}%`, backgroundColor: figma.colors.primary }}
          />
        </div>
        <span className="shrink-0 text-[14px] font-bold" style={{ color: figma.colors.primary }}>
          {attendanceRate}%
        </span>
      </div>

      <div className="mt-4 rounded-lg bg-[#f7f8fa] px-5 py-4">
        <ul className={cn("space-y-1.5 text-[12.5px] leading-relaxed", figmaClass.textMuted)}>
          {NOTICE_ITEMS.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
