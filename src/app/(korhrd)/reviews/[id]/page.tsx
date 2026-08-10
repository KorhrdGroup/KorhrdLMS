import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  getCourseReview,
  listCourseReviews,
} from '@/features/korhrd/services/course-review.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { REVIEW_CERT } from '@/features/korhrd/components/review/ReviewRow';

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
          <p className="article__meta">
            <span>작성 <b>{review.author} 수강생</b></span>
            <span>등록일 <b><time dateTime={review.date}>{review.date}</time></b></span>
          </p>
          {/* 작성자 블록 — 사진이 없으면 자리표시(.ph)가 그대로 보입니다 */}
          <div className="article__profile">
            <span className="ph" aria-hidden="true" />
            <div>
              <b>{review.author} 수강생</b>
              <span>{[review.course, ...review.alsoCourses].join(' · ')} 취득</span>
            </div>
          </div>

          <p className="article__tags">
            <span>{review.course}</span>
            {review.alsoCourses.map((course) => <span key={course}>{course}</span>)}
          </p>
        </div>

        <div className="article__body" style={{ whiteSpace: 'pre-line' }}>
          {review.body}
        </div>

        {/* 목록과 같은 자격증 예시 이미지 (2026-08-10, 디자인 요청) */}
        <Image
          src={REVIEW_CERT} alt="자격증 예시"
          width={360} height={509} sizes="360px"
          style={{ maxWidth: 360, height: 'auto', borderRadius: 8 }}
        />

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
