'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Review } from '@/features/korhrd/lib/types';
import HelpfulButton from './HelpfulButton';

/**
 * 합격후기 목록의 후기 카드 (Figma card_review 249:12331).
 *
 * 마크업은 모바일 구조(세로 4단) 한 벌만 두고,
 * 561px 이상에서는 CSS(display:contents + grid-area)로 2열 배치로 재배치합니다.
 * styles/review.css 의 .review-row 규칙을 참고하세요.
 */
export default function ReviewRow({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [mine, setMine] = useState(!!review.helpfulByMe);

  return (
    <article className="review-row">
      <div className="review-row__top">
        {/* 사진이 없으면 자리표시가 숨겨집니다 */}
        {review.photo ? (
          <img className="ph ph--cert-lg" src={review.photo} alt="" />
        ) : (
          <span className="ph ph--cert-lg" aria-hidden="true">자격증 사진<small>1 : 1</small></span>
        )}
        <div>
          <h2><Link href={`/reviews/${review.id}`}>{review.title}</Link></h2>
          <p className="review-row__meta">
            {review.author} 수강생 · <time dateTime={review.date}>{review.date}</time>
          </p>
        </div>
      </div>

      {/* 대표 과정 + 함께 수강한 과정 */}
      <p className="review-row__tags">
        <span>{review.course}</span>
        {review.alsoCourses.map((c) => <span key={c}>{c}</span>)}
      </p>

      <p>{review.body}</p>

      <HelpfulButton
        className="review-row__help"
        count={helpful}
        active={mine}
        onToggle={() => {
          setHelpful((n) => n + (mine ? -1 : 1));
          setMine((v) => !v);
        }}
      />
    </article>
  );
}
