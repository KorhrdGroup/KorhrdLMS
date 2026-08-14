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


  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/support">고객센터</Link></li>
          <li><Link href="/support">공지사항</Link></li>
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

        {/* 내용 없이 이미지·첨부만 있는 공지는 본문 영역(최소 높이·여백)을 아예 그리지 않습니다 */}
        {notice.body.trim() ? (
          <div className="article__body" style={{ whiteSpace: "pre-line" }}>
            {notice.body}
          </div>
        ) : null}

        {/* 본문 이미지 — 어드민 "본문 이미지" 필드. 첨부파일(다운로드)과 별개입니다.
            어드민이 링크를 설정했으면 클릭 시 그 주소로 이동합니다. */}
        {notice.imageUrl ? (
          <div className="article__body">
            {notice.imageLinkUrl ? (
              <a
                href={notice.imageLinkUrl}
                {...(/^https?:\/\//.test(notice.imageLinkUrl)
                  ? { target: "_blank", rel: "noopener" }
                  : {})}
              >
                {/* 외부 저장소(Supabase Storage) 주소라 next/image 대신 img 를 씁니다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={notice.imageUrl}
                  alt={notice.title}
                  style={{ maxWidth: "100%", height: "auto", cursor: "pointer" }}
                />
              </a>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={notice.imageUrl}
                alt={notice.title}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            )}
          </div>
        ) : null}

        {notice.attachment ? (
          /* 첨부파일 — 버튼 줄(.article__actions, 가운데 정렬)이 아니라
             본문처럼 왼쪽에 붙이고, 클립 아이콘으로 첨부임을 드러냅니다. */
          <p style={{ marginTop: 20 }}>
            {/* Storage가 다른 출처라 <a download> 가 안 먹혀, 같은 출처 API 로 내려받습니다 */}
            <a
              className="btn btn--ghost"
              href={`/api/notices/${notice.id}/download`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              첨부파일 : {notice.attachment.fileName} ({notice.attachment.fileSizeLabel})
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
          <Link className="btn btn--primary" href="/support">목록으로</Link>
        </p>
      </article>
    </div>
  );
}
