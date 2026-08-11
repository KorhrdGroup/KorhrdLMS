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
  const index = notices.findIndex((n) => n.id === id);
  const notice = notices[index];
  if (!notice) notFound();

  // 목록 정렬(고정공지 우선 → 최신순)을 그대로 따라 앞뒤 글을 집습니다.
  const prev = index > 0 ? notices[index - 1] : null;
  const next = index < notices.length - 1 ? notices[index + 1] : null;

  // 이미지 첨부는 본문처럼 바로 보여주고, 다운로드 버튼은 그대로 둡니다.
  const isImageAttachment =
    notice.attachment != null &&
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(notice.attachment.fileName);

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

        {notice.attachment && isImageAttachment ? (
          <div className="article__body">
            {/* R2 등 외부 저장소 주소라 next/image 대신 img 를 씁니다 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={notice.attachment.fileUrl}
              alt={notice.title}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        ) : null}

        {notice.attachment ? (
          <p className="article__actions">
            <a className="btn btn--ghost" href={notice.attachment.fileUrl} download>
              첨부파일 {notice.attachment.fileName} ({notice.attachment.fileSizeLabel})
            </a>
          </p>
        ) : null}

        {/* 이전/다음 글 — 원본 notice-detail.html 과 같은 구조입니다 */}
        {prev || next ? (
          <nav className="article__nav" aria-label="이전 다음 글">
            {prev ? (
              <Link href={`/notice/${prev.id}`}>
                <span className="article__nav-label">이전 글</span>
                <span className="article__nav-tit">{prev.title}</span>
              </Link>
            ) : null}
            {next ? (
              <Link href={`/notice/${next.id}`}>
                <span className="article__nav-label">다음 글</span>
                <span className="article__nav-tit">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}

        <p className="article__actions">
          <Link className="btn btn--primary" href="/notice">목록으로</Link>
        </p>
      </article>
    </div>
  );
}
