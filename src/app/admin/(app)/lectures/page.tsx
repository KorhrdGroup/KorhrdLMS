import type { Metadata } from "next";

import { LectureListView } from "@/features/lectures/components/lecture-list-view";
import { parseLectureListQuery } from "@/features/lectures/lib/lecture-list-query";
import {
  getLectureFilterOptions,
  getLectureList,
} from "@/features/lectures/services/lecture-list.service";

export const metadata: Metadata = {
  title: "차시관리 | 과정관리",
};

type LecturesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LecturesPage({ searchParams }: LecturesPageProps) {
  const params = await searchParams;
  const query = parseLectureListQuery(params);

  try {
    const [result, filterOptions] = await Promise.all([
      getLectureList(query),
      getLectureFilterOptions(),
    ]);

    return (
      <LectureListView result={result} query={query} filterOptions={filterOptions} />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "강의 목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">차시관리</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
