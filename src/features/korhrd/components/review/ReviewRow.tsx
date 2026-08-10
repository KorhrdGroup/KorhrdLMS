'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Review } from '@/features/korhrd/lib/types';
import HelpfulButton from './HelpfulButton';

/** 합격후기에 공통으로 쓰는 자격증 예시 이미지 (목록·상세 같은 파일) */
export const REVIEW_CERT = '/review-cert.png';

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
        {/* 후기 사진은 자격증 예시 이미지 한 장으로 통일합니다 (2026-08-10, 디자인 요청).
            자리는 .ph--cert-lg 가 잡은 140x140 정사각인데 자격증은 세로가 길어,
            잘리지 않도록 contain 으로 넣습니다(REVIEW_CERT). */}
        <Image
          className="ph ph--cert-lg" src={REVIEW_CERT} alt=""
          width={140} height={140} style={{ objectFit: 'contain', background: '#fff' }}
        />
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
