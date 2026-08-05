import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedNoticesForSite } from "@/features/notice-management/services/notice-student-view.service";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = (await getPublishedNoticesForSite()).find((n) => n.id === id);
  return { title: `${notice?.title ?? "공지사항"} — 한평생 직업훈련` };
}

/** 공지 상세 — 마크업은 korhrd 디자인(notice-detail.html), 본문은 어드민 공지 DB. */
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const notices = await getPublishedNoticesForSite();
  const notice = notices.find((n) => n.id === id);
  if (!notice) notFound();

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/notice">공지사항</Link></li>
          <li aria-current="page">상세보기</li>
        </ol>
      </nav>

      <article className="article">
        <div className="article__head">
          {notice.pinned ? <span className="article__cat">공지</span> : null}
          <h1 className="article__title">{notice.title}</h1>
          <p className="article__meta">
            <span>작성자 <b>한평생 직업훈련</b></span>
            <span>등록일 <b><time dateTime={notice.date}>{notice.date}</time></b></span>
          </p>
        </div>

        <div className="article__body" style={{ whiteSpace: "pre-line" }}>
          {notice.body}
        </div>

        {notice.attachment ? (
          <div className="article__files">
            <a href={notice.attachment.fileUrl} download>
              {notice.attachment.fileName}
              <span style={{ color: "var(--muted)" }}> ({notice.attachment.fileSizeLabel})</span>
            </a>
          </div>
        ) : null}
      </article>

      <div className="text-center mt-6">
        <Link className="btn btn--ghost" href="/notice">목록으로</Link>
      </div>
    </div>
  );
}
