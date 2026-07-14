"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { buildBoardListQueryString } from "@/features/boards/lib/board-list-query";
import type { BoardListQuery } from "@/features/boards/types/board.types";
import type { BoardType } from "@/types/database.types";

type BoardListToolbarProps = {
  boardType: BoardType;
  query: BoardListQuery;
};

export function BoardListToolbar({ boardType, query }: BoardListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();

    startTransition(() => {
      router.push(
        `/admin/boards/${boardType}${buildBoardListQueryString(boardType, { page: 1, search }, query)}`,
      );
    });
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSearchSubmit}>
      <label className="flex-1 space-y-1.5">
        <span className="block text-sm font-medium text-[#374151]">검색</span>
        <AdminInput
          name="search"
          variant="outline"
          defaultValue={query.search}
          placeholder="제목, 내용, 작성자 검색"
          disabled={isPending}
        />
      </label>
      <AdminButton type="submit" disabled={isPending}>
        <Search className="size-4" />
        검색
      </AdminButton>
    </form>
  );
}
