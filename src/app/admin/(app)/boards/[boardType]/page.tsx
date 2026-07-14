import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BoardListView } from "@/features/boards/components/board-list-view";
import { BOARD_TYPE_LABELS } from "@/features/boards/constants";
import {
  isBoardType,
  parseBoardListQuery,
} from "@/features/boards/lib/board-list-query";
import { getBoardList } from "@/features/boards/services/board-list.service";

type BoardTypePageProps = {
  params: Promise<{ boardType: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: BoardTypePageProps): Promise<Metadata> {
  const { boardType } = await params;

  if (!isBoardType(boardType)) {
    return { title: "게시판관리" };
  }

  return { title: `${BOARD_TYPE_LABELS[boardType]} | 게시판관리` };
}

export default async function BoardTypePage({
  params,
  searchParams,
}: BoardTypePageProps) {
  const { boardType } = await params;

  if (!isBoardType(boardType)) {
    notFound();
  }

  const queryParams = await searchParams;
  const query = parseBoardListQuery(queryParams);

  try {
    const result = await getBoardList(boardType, query);

    return <BoardListView boardType={boardType} result={result} query={query} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "게시글 목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">게시판관리</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
