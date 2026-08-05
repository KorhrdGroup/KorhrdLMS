import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getCourseReview } from '@/features/korhrd/services/course-review.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

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
          <p className="article__tags">
            <span>{review.course}</span>
            {review.alsoCourses.map((course) => <span key={course}>{course}</span>)}
          </p>
        </div>

        <div className="article__body" style={{ whiteSpace: 'pre-line' }}>
          {review.body}
        </div>

        {review.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.photo} alt="자격증 사진" style={{ maxWidth: 360, borderRadius: 8 }} />
        ) : null}
      </article>

      <p className="rv-cta" style={{ display: 'flex', gap: 8 }}>
        <Link className="btn btn--ghost" href="/reviews">목록으로</Link>
        {review.mine ? (
          <Link className="btn btn--primary" href={`/reviews/write?id=${review.id}`}>수정하기</Link>
        ) : null}
      </p>
    </div>
  );
}
