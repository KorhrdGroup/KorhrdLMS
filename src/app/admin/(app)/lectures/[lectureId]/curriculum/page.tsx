import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LectureCurriculumView } from "@/features/lectures/components/lecture-curriculum-view";
import { getLectureCurriculum } from "@/features/lectures/services/lecture-curriculum.service";

export const metadata: Metadata = {
  title: "차시 관리",
};

type LectureCurriculumPageProps = {
  params: Promise<{ lectureId: string }>;
};

export default async function LectureCurriculumPage({
  params,
}: LectureCurriculumPageProps) {
  const { lectureId } = await params;

  try {
    const result = await getLectureCurriculum(lectureId);

    if (!result.success) {
      notFound();
    }

    return (
      <LectureCurriculumView summary={result.summary} sessions={result.sessions} />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "차시 정보를 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">차시 관리</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
      </div>
    );
  }
}
