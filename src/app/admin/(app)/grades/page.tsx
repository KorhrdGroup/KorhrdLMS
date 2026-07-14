import type { Metadata } from "next";

import { GradeListView } from "@/features/grades/components/grade-list-view";
import { parseGradeListQuery } from "@/features/grades/lib/grade-list-query";
import { getGradeList } from "@/features/grades/services/grade-list.service";

export const metadata: Metadata = {
  title: "성적관리",
};

type GradesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GradesPage({ searchParams }: GradesPageProps) {
  const params = await searchParams;
  const query = parseGradeListQuery(params);

  try {
    const result = await getGradeList(query);
    return <GradeListView result={result} query={query} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "성적목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">성적관리</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
