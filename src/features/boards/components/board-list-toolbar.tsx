"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import { buildBoardListQueryString } from "@/features/boards/lib/board-list-query";
import type { BoardListQuery } from "@/features/boards/types/board.types";
import type { BoardType } from "@/types/database.types";

const inputBox: CSSProperties = {
  height: 38,
  border: `1px solid ${M.border}`,
  borderRadius: 8,
  padding: "0 14px",
  fontSize: 13,
  color: M.text,
  outline: "none",
  background: "#fff",
};

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
    <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input
        name="search"
        defaultValue={query.search}
        placeholder="제목, 내용, 작성자 검색"
        disabled={isPending}
        style={{ ...inputBox, width: 280 }}
      />
      <button
        type="submit"
        disabled={isPending}
        style={{
          height: 38,
          padding: "0 18px",
          borderRadius: 8,
          background: M.ink,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: isPending ? "wait" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        검색
      </button>
    </form>
  );
}
