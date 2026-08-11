import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  getCourseReview,
  listCourseReviews,
} from '@/features/korhrd/services/course-review.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import ReviewHelpful from './ReviewHelpful';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const review = await getCourseReview(id);
  return { title: `${review?.title ?? '합격후기'} — 한평생 직업훈련` };
}

/** 후기 상세 — 마크업은 korhrd 디자인, 내용은 course_reviews 테이블. */
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const member = await getMockableStudentMember();
  const review = await getCourseReview(id, member?.id);
  if (!review) notFound();

  // 이전/다음 글은 목록과 같은 정렬(최신순)을 따릅니다.
  const list = await listCourseReviews({ viewerId: member?.id });
  const index = list.findIndex((r) => r.id === id);
  const prev = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/reviews">합격후기</Link></li>
          <li aria-current="page">상세보기</li>
        </ol>
      </nav>

      <article className="article">
        <div className="article__head">
          <h1 className="article__title">{review.title}</h1>
          {/* 작성자 블록 — 프로필 사진 기능이 없어 동그라미 자리표시는 뺐습니다 (2026-08-11)
              등록일은 같은 줄 오른쪽 끝에 둡니다(space-between). */}
          <div
            className="article__profile"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <b>{review.author} 수강생</b>
              <span>{[review.course, ...review.alsoCourses].join(' · ')} 취득</span>
            </div>
            <span className="article__meta">
              등록일 <b><time dateTime={review.date}>{review.date}</time></b>
            </span>
          </div>

          <p className="article__tags">
            <span>{review.course}</span>
            {review.alsoCourses.map((course) => <span key={course}>{course}</span>)}
          </p>
        </div>

        <div className="article__body" style={{ whiteSpace: 'pre-line' }}>
          {review.body}
          {/* 상세에는 자격증 예시 이미지를 넣지 않습니다 (2026-08-10, 디자인 요청).
              수강생이 직접 올린 사진만 본문 안에 함께 보여줍니다. */}
          {review.photo ? (
            <p style={{ marginTop: 24 }}>
              {/* 업로드 사진은 버킷이 정해져 있지 않아 next/image(remotePatterns) 대상이 아닙니다 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={review.photo} alt="자격증 사진" style={{ maxWidth: 360, borderRadius: 8 }} />
            </p>
          ) : null}
        </div>

        <ReviewHelpful
          reviewId={review.id}
          count={review.helpful}
          active={review.helpfulByMe}
        />

        {/* 이전/다음 글 — 원본 review-detail.html 과 같은 구조입니다 */}
        {prev || next ? (
          <nav className="article__nav" aria-label="이전 다음 글">
            {prev ? (
              <Link href={`/reviews/${prev.id}`}>
                <span className="article__nav-label">이전 글</span>
                <span className="article__nav-tit">{prev.title}</span>
              </Link>
            ) : null}
            {next ? (
              <Link href={`/reviews/${next.id}`}>
                <span className="article__nav-label">다음 글</span>
                <span className="article__nav-tit">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}

        <p className="article__actions">
          <Link className="btn btn--primary" href="/reviews">목록으로</Link>
          {review.mine ? (
            <Link className="btn btn--ghost" href={`/reviews/write?id=${review.id}`}>수정하기</Link>
          ) : null}
        </p>
      </article>
    </div>
  );
}
