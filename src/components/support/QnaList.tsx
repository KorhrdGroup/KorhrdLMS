"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { figma, figmaClass } from "@/components/home/home-design";
import { NoticePagination } from "@/components/notice/NoticePagination";
import { getMyTickets, getTicketStatusLabel, type SupportTicket } from "@/lib/support/ticket-store";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
type SearchField = "title" | "content";

export function QnaList() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [fields, setFields] = useState<SearchField[]>(["title"]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setTickets(getMyTickets());
  }, []);

  const toggleField = (field: SearchField) => {
    setFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]));
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedQuery(query);
    setPage(1);
  };

  const filteredTickets = useMemo(() => {
    const keyword = submittedQuery.trim().toLowerCase();
    if (!keyword) return tickets;
    return tickets.filter((ticket) => {
      const matchesTitle = fields.includes("title") && ticket.title.toLowerCase().includes(keyword);
      const matchesContent = fields.includes("content") && ticket.content.toLowerCase().includes(keyword);
      return matchesTitle || matchesContent;
    });
  }, [tickets, fields, submittedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTickets = filteredTickets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const emptyMessage = tickets.length === 0 ? "등록된 게시물이 없습니다." : "검색 결과가 없습니다.";

  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>1:1 상담</h2>

      <div className="mb-4 rounded-lg bg-[#f4f8ff] px-4 py-3 text-center text-[13px] leading-relaxed text-[#00376e]">
        1:1 상담은 로그인 한 상태에서 본인이 작성한 질문만 보실 수 있습니다.
        <br />
        질문에 대한 답변을 보시려면 반드시 로그인 해 주시기 바랍니다.
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

      <div className={cn("overflow-x-auto border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <table className="w-full min-w-[560px] text-[14px]">
          <thead>
            <tr className="border-b bg-[#f7f8fa]" style={{ borderColor: figma.colors.border }}>
              <th className="w-[70px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">번호</th>
              <th className="py-3 pl-4 text-left text-[13px] font-semibold text-[#3d3d3d]">제목</th>
              <th className="w-[120px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">등록일</th>
              <th className="w-[100px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">글쓴이</th>
              <th className="w-[100px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">상태</th>
            </tr>
          </thead>
          <tbody>
            {pagedTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b transition-colors duration-200 last:border-0 hover:bg-[#f4f8ff]"
                style={{ borderColor: figma.colors.border }}
              >
                <td className={cn("py-3.5 text-center", figmaClass.textPlaceholder)}>{ticket.seq}</td>
                <td className="py-3.5 pl-4">
                  <Link
                    href={`/support/qna/${ticket.id}`}
                    className={cn(
                      "transition-colors duration-200 hover:text-[#00376e] hover:underline",
                      figmaClass.textBody,
                    )}
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className={cn("py-3.5 text-center text-[13px]", figmaClass.textPlaceholder)}>
                  {ticket.createdAt}
                </td>
                <td className={cn("py-3.5 text-center text-[13px]", figmaClass.textBody)}>{ticket.userName}</td>
                <td className="py-3.5 text-center">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                      ticket.status === "answered"
                        ? "bg-[#e5edff] text-[#00376e]"
                        : "bg-[#f0f0f0] text-[#656565]",
                    )}
                  >
                    {getTicketStatusLabel(ticket.status)}
                  </span>
                </td>
              </tr>
            ))}
            {pagedTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className={cn("py-16 text-center text-[14px]", figmaClass.textPlaceholder)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <NoticePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />

      <div className="mt-4 flex justify-end">
        <Link
          href="/support/qna/write"
          className="flex h-10 shrink-0 items-center justify-center rounded-lg px-5 text-[13px] font-bold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: figma.colors.primary }}
        >
          글쓰기
        </Link>
      </div>
    </div>
  );
}
