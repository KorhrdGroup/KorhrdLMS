"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { figma, figmaClass } from "@/components/home/home-design";
import type { NoticeListItem } from "@/components/notice/data/notice-data";
import { NoticePagination } from "@/components/notice/NoticePagination";
import { cn } from "@/lib/utils";

type SearchField = "title" | "content";

export function NoticeBoard({ items, title = "공지사항" }: { items: NoticeListItem[]; title?: string }) {
  const [fields, setFields] = useState<SearchField[]>(["title"]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const toggleField = (field: SearchField) => {
    setFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]));
  };

  const filteredItems = useMemo(() => {
    const keyword = submittedQuery.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.title.toLowerCase().includes(keyword));
  }, [items, submittedQuery]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedQuery(query);
  };

  const emptyMessage = items.length === 0 ? "등록된 글이 없습니다." : "검색 결과가 없습니다.";

  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>{title}</h2>

      <form
        onSubmit={handleSearch}
        className={cn(
          "mb-4 flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:gap-4",
          figmaClass.roundedCard,
          figmaClass.borderDefault,
        )}
      >
        <div className={cn("flex shrink-0 items-center gap-4 text-[13px]", figmaClass.textSub)}>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={fields.includes("title")}
              onChange={() => toggleField("title")}
              className="size-3.5 accent-[#00376e]"
            />
            제목
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={fields.includes("content")}
              onChange={() => toggleField("content")}
              className="size-3.5 accent-[#00376e]"
            />
            내용
          </label>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="검색어를 입력해주세요."
            className={cn(
              "h-10 min-w-0 flex-1 rounded-lg border px-3 text-[13px] outline-none transition-colors duration-200 focus:border-[#00376e]",
              figmaClass.borderDefault,
            )}
          />
          <button
            type="submit"
            aria-label="검색"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: figma.colors.primary }}
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>

      <div className={cn("overflow-x-auto border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <table className="w-full min-w-[520px] text-[14px]">
          <thead>
            <tr className="border-b bg-[#f7f8fa]" style={{ borderColor: figma.colors.border }}>
              <th className="w-[80px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">번호</th>
              <th className="py-3 pl-4 text-left text-[13px] font-semibold text-[#3d3d3d]">제목</th>
              <th className="w-[140px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">날짜</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className="border-b transition-colors duration-200 last:border-0 hover:bg-[#f4f8ff]"
                style={{ borderColor: figma.colors.border }}
              >
                <td className="py-3.5 text-center">
                  {item.pinned ? (
                    <span className="inline-flex rounded bg-[#e5433f]/10 px-2 py-1 text-[11px] font-bold text-[#e5433f]">
                      필독
                    </span>
                  ) : (
                    <span className={figmaClass.textPlaceholder}>{item.no}</span>
                  )}
                </td>
                <td className="py-3.5 pl-4">
                  <Link
                    href={`/notice/${item.id}`}
                    className={cn(
                      "transition-colors duration-200 hover:text-[#00376e] hover:underline",
                      item.pinned ? "font-bold text-[#010101]" : figmaClass.textBody,
                    )}
                  >
                    {item.title}
                  </Link>
                </td>
                <td className={cn("py-3.5 text-center text-[13px]", figmaClass.textPlaceholder)}>{item.date}</td>
              </tr>
            ))}
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={3} className={cn("py-16 text-center text-[14px]", figmaClass.textPlaceholder)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <NoticePagination currentPage={1} totalPages={1} />
    </div>
  );
}
