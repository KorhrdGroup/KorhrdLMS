import type { Metadata } from "next";
import Link from "next/link";

import { getPublishedNoticesForSite } from "@/features/notice-management/services/notice-student-view.service";

import { NoticeFilter } from "./NoticeFilter";
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
  const cat = Array.isArray(params.cat) ? params.cat[0] : params.cat;

  const all = await getPublishedNoticesForSite();
  // 분류 탭 — "전체"(cat 없음)면 모두, 아니면 해당 분류만. 고정 공지는 항상 남깁니다.
  const notices = cat ? all.filter((n) => n.pinned || n.category === cat) : all;
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

      {/* 원본 notice.html 은 제목만 둡니다 — 설명 문구는 넣지 않습니다 */}
      <div className="page-head">
        <h1>공지사항</h1>
      </div>

      <div className="toolbar">
        <p className="toolbar__result">전체 <b>{notices.length}</b>건</p>
        <NoticeFilter />
      </div>

      {/* 번호 칸 클래스는 반드시 .no 입니다 — CSS(account.css)가 `.board .no`에
          걸려 있어 다른 이름을 쓰면 칸 폭(40px)·정렬이 사라집니다 */}
      <ul className="board">
        {slice.map((notice) => (
          <li key={notice.id}>
            {notice.pinned ? (
              <span className="badge badge--best">공지</span>
            ) : (
              <span className="no">{notice.no}</span>
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
