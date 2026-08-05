import type { Metadata } from "next";
import Link from "next/link";

import { getPublishedNoticesForSite } from "@/features/notice-management/services/notice-student-view.service";

import { NoticePagination } from "./NoticePagination";

export const metadata: Metadata = {
  title: "공지사항 — 한평생 직업훈련",
  description: "한평생 직업훈련 공지사항",
};

const PER_PAGE = 10;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * 공지사항 목록 — 마크업은 korhrd 디자인(notice.html), 데이터는 어드민 공지 DB.
 * 고정 공지는 '공지' 배지가 붙고 번호 대신 맨 위에 옵니다(서비스가 그렇게 정렬해 줍니다).
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const notices = await getPublishedNoticesForSite();
  const totalPages = Math.max(1, Math.ceil(notices.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const slice = notices.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li aria-current="page">공지사항</li>
        </ol>
      </nav>

      <div className="page-head">
        <h1>공지사항</h1>
        <p>수강·시험·자격증 발급 관련 소식을 알려드립니다.</p>
      </div>

      <div className="toolbar">
        <p className="toolbar__result">전체 <b>{notices.length}</b>건</p>
      </div>

      <ul className="board">
        {slice.map((notice) => (
          <li key={notice.id}>
            {notice.pinned ? (
              <span className="badge badge--best">공지</span>
            ) : (
              <span className="board__no">{notice.no}</span>
            )}
            <Link className="tit" href={`/notice/${notice.id}`}>{notice.title}</Link>
            <span className="date">
              <span className="date__cent">{notice.date.slice(0, 2)}</span>
              {notice.date.slice(2)}
            </span>
          </li>
        ))}
        {slice.length === 0 ? (
          <li><span className="tit">등록된 공지가 없습니다.</span></li>
        ) : null}
      </ul>

      <NoticePagination current={current} total={totalPages} />
    </div>
  );
}
