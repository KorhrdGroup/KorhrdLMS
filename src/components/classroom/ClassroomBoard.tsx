"use client";

import { Info } from "lucide-react";
import { useMemo, useState } from "react";

import { CompletedCourseCard } from "@/components/classroom/CompletedCourseCard";
import { InProgressCourseCard } from "@/components/classroom/InProgressCourseCard";
import { figma, figmaClass } from "@/components/home/home-design";
import type {
  MyActiveEnrollment,
  MyPendingEnrollment,
} from "@/features/enrollment-catalog/types/my-enrollments.types";
import { QuickContactPanel } from "@/components/shared/QuickContactPanel";
import { cn } from "@/lib/utils";

type TabId = "in-progress" | "pending" | "completed";

const TABS: { id: TabId; label: string }[] = [
  { id: "in-progress", label: "수강중인 과목" },
  { id: "pending", label: "수강신청중인 과목" },
  { id: "completed", label: "수강완료 과목" },
];

export function ClassroomBoard({
  pendingEnrollments,
  activeEnrollments,
}: {
  pendingEnrollments: MyPendingEnrollment[];
  activeEnrollments: MyActiveEnrollment[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("in-progress");

  const inProgressCourses = useMemo(
    () => activeEnrollments.filter((item) => item.learningStatus === "in_progress"),
    [activeEnrollments],
  );
  const completedCourses = useMemo(
    () => activeEnrollments.filter((item) => item.learningStatus === "ended"),
    [activeEnrollments],
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:w-[230px]">
        <QuickContactPanel />
      </aside>

      <div className="min-w-0 flex-1">
        <div
          className={cn("mb-5 flex items-center gap-6 border-b", figmaClass.borderDefault)}
          role="tablist"
          aria-label="학습강의실 탭"
        >
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 pb-3 text-[15px] transition-colors duration-200",
                  active ? cn("font-bold", figmaClass.textPrimary) : cn("font-medium", figmaClass.textPlaceholder),
                )}
              >
                {active ? (
                  <span
                    className="absolute -top-0.5 left-1/2 size-1.5 -translate-x-1/2 -translate-y-full rounded-full"
                    style={{ backgroundColor: figma.colors.primary }}
                  />
                ) : null}
                {tab.label}
                {active ? (
                  <span
                    className="absolute inset-x-0 -bottom-px h-[2px] rounded-full"
                    style={{ backgroundColor: figma.colors.primary }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {activeTab === "in-progress" ? (
          <div className="flex flex-col gap-4">
            {inProgressCourses.length === 0 ? (
              <EmptyState message="수강중인 강좌가 존재하지 않습니다." />
            ) : (
              inProgressCourses.map((course) => <InProgressCourseCard key={course.id} course={course} />)
            )}
          </div>
        ) : null}

        {activeTab === "pending" ? (
          <div className="flex flex-col gap-4">
            {pendingEnrollments.length === 0 ? (
              <EmptyState message="수강 신청중인 강좌가 존재하지 않습니다." />
            ) : (
              <div className={cn("overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault)}>
                {pendingEnrollments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b px-5 py-4 text-[14px] last:border-0"
                    style={{ borderColor: figma.colors.border }}
                  >
                    <span className={figmaClass.textBody}>{item.courseTitle}</span>
                    <span className={cn("text-[13px]", figmaClass.textPlaceholder)}>{item.appliedAt}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-[#f4f8ff] px-4 py-3 text-[12.5px] leading-relaxed text-[#00376e]">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              관리자가 반배정후 24시간내 수강등록완료 및 학사일정 문자전송 (주말은 익영업일 처리)
            </div>
          </div>
        ) : null}

        {activeTab === "completed" ? (
          <div className="flex flex-col gap-4">
            {completedCourses.length === 0 ? (
              <EmptyState message="수강완료한 강좌가 존재하지 않습니다." />
            ) : (
              completedCourses.map((course) => <CompletedCourseCard key={course.id} course={course} />)
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border px-6 py-16 text-center text-[14px]",
        figmaClass.roundedCard,
        figmaClass.borderDefault,
        figmaClass.textPlaceholder,
      )}
    >
      {message}
    </div>
  );
}
