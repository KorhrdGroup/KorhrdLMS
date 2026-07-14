"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { figma, figmaClass } from "@/components/home/home-design";
import { FAQ_CATEGORIES, FAQ_LIST_ITEMS, getFaqCategoryLabel } from "@/components/faq/data/faq-data";
import { NoticePagination } from "@/components/notice/NoticePagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const ALL_CATEGORY_ID = "all";

type SearchField = "title" | "content";

export function FaqBoard() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY_ID);
  const [fields, setFields] = useState<SearchField[]>(["title"]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);

  const toggleField = (field: SearchField) => {
    setFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]));
  };

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    setPage(1);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedQuery(query);
    setPage(1);
  };

  const filteredItems = useMemo(() => {
    const keyword = submittedQuery.trim().toLowerCase();

    return FAQ_LIST_ITEMS.filter((item) => {
      if (activeCategory !== ALL_CATEGORY_ID && item.category !== activeCategory) return false;
      if (!keyword) return true;

      const matchesTitle = fields.includes("title") && item.question.toLowerCase().includes(keyword);
      const matchesContent = fields.includes("content") && item.answer.toLowerCase().includes(keyword);
      return matchesTitle || matchesContent;
    });
  }, [activeCategory, fields, submittedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const emptyMessage = FAQ_LIST_ITEMS.length === 0 ? "등록된 글이 없습니다." : "검색 결과가 없습니다.";

  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>자주하는 질문</h2>

      <div
        className={cn("mb-4 flex flex-wrap gap-2 border-b pb-4", figmaClass.borderDefault)}
        role="tablist"
        aria-label="FAQ 카테고리"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === ALL_CATEGORY_ID}
          onClick={() => handleSelectCategory(ALL_CATEGORY_ID)}
          className={cn(
            "rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200",
            activeCategory === ALL_CATEGORY_ID
              ? "border-transparent text-white"
              : cn(figmaClass.textSub, figmaClass.borderDefault, "bg-white hover:bg-[#f4f8ff] hover:text-[#00376e]"),
          )}
          style={activeCategory === ALL_CATEGORY_ID ? { backgroundColor: figma.colors.primary } : undefined}
        >
          전체
        </button>
        {FAQ_CATEGORIES.map((category) => {
          const active = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSelectCategory(category.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200",
                active
                  ? "border-transparent text-white"
                  : cn(figmaClass.textSub, figmaClass.borderDefault, "bg-white hover:bg-[#f4f8ff] hover:text-[#00376e]"),
              )}
              style={active ? { backgroundColor: figma.colors.primary } : undefined}
            >
              {category.label}
            </button>
          );
        })}
      </div>

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

      <div className={cn("border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {pagedItems.length === 0 ? (
          <p className={cn("py-16 text-center text-[14px]", figmaClass.textPlaceholder)}>{emptyMessage}</p>
        ) : (
          <Accordion className="px-4 sm:px-6">
            {pagedItems.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-[#e0e0e0]">
                <AccordionTrigger className="items-center gap-3 rounded-none border-transparent py-4 hover:no-underline">
                  <span className="w-[92px] shrink-0 text-[13px] font-bold text-[#00376e] sm:w-[110px]">
                    {getFaqCategoryLabel(item.category)}
                  </span>
                  <span className={cn("min-w-0 flex-1 text-left text-[14px] font-medium", figmaClass.textBody)}>
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-lg bg-[#f7f8fa] px-4 py-4 sm:ml-[122px]">
                    <p className={cn("text-[13px] leading-relaxed whitespace-pre-line", figmaClass.textMuted)}>
                      {item.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <NoticePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
