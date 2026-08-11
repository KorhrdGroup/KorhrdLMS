'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CourseReviewItem } from '@/features/korhrd/services/course-review.service';
import { PRIVATE_CERT_TOP5, popularNameKey } from '@/features/korhrd/data/popular-top5';
import ReviewRow from '@/features/korhrd/components/review/ReviewRow';
import Pagination from '@/features/korhrd/components/ui/Pagination';

/**
 * 합격후기 목록.
 * 프로토타입 원본: korhrd-site/reviews.html
 *
 * 필터는 대표 과정(Review.course)만 봅니다 — 함께 수강 태그는 표시 전용입니다.
 */
const PER_PAGE = 5;

export default function ReviewsClient({ reviews: REVIEWS }: { reviews: CourseReviewItem[] }) {
  const [course, setCourse] = useState('');
  const [sort, setSort] = useState<'new' | 'helpful'>('new');
  const [page, setPage] = useState(1);

  /* 셀렉트 목록은 실제로 후기가 있는 과정만 (빈 결과가 나오는 선택지를 없앱니다).
     민간자격증 Top5 는 맨 앞에 고정하고 나머지는 가나다순입니다. */
  const courseOptions = useMemo(() => {
    const all = [...new Set(REVIEWS.map((r) => r.course))];
    const top5Keys = PRIVATE_CERT_TOP5.map(popularNameKey);
    const pinned = top5Keys
      .map((key) => all.find((name) => popularNameKey(name) === key))
      .filter((name): name is string => Boolean(name));
    const rest = all
      .filter((name) => !pinned.includes(name))
      .sort((a, b) => a.localeCompare(b, 'ko'));
    return [...pinned, ...rest];
  }, [REVIEWS]);

  const rows = useMemo(() => {
    const hit = course ? REVIEWS.filter((r) => r.course === course) : REVIEWS;
    return [...hit].sort((a, b) =>
      sort === 'helpful' ? b.helpful - a.helpful || b.date.localeCompare(a.date) : b.date.localeCompare(a.date),
    );
  }, [course, sort, REVIEWS]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const shown = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li aria-current="page">합격후기</li>
        </ol>
      </nav>

      <section className="review-hero">
        <div className="review-hero__top">
          <div>
            <p className="review-hero__brand">
              <span className="logo logo--sm">
                <img src="/logo_white.svg" alt="한평생 직업훈련" width={147} height={18} />
              </span>
            </p>
            {/* br-mo: 모바일에서만 줄바꿈 */}
            <h1>합격한 수강생들의 <br className="br-mo" />이야기를 만나보세요</h1>
            <p>
              한평생 직업훈련에서 합격과 수료를 이뤄낸 수강생들의 생생한 이야기를 확인해보세요.<br />
              여러분의 노력은 반드시 결과로 이어집니다.
            </p>
          </div>
          {/* 원본 1000×500. CSS 가 230px 로 고정합니다(좁은 화면에서는 숨김) */}
          <Image
            className="review-hero__graphic" src="/review-hero-graphic.png"
            alt="" aria-hidden="true"
            width={1000} height={500} sizes="230px"
          />
        </div>

        <div className="review-hero__event">
          <strong>후기 작성 이벤트</strong>
          <span>후기를 작성해주신 수강생분들께 추첨을 통해 커피 기프티콘을 드립니다.</span>
        </div>
      </section>

      <div className="review-filter mt-6">
        <label className="sr-only" htmlFor="course-filter">자격증 과정 선택</label>
        <select
          className="select-box" id="course-filter" value={course}
          onChange={(e) => { setCourse(e.target.value); setPage(1); }}
        >
          <option value="">자격증 과정 전체</option>
          {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="sort-group" role="group" aria-label="정렬">
          {([['new', '최신순'], ['helpful', '도움순']] as const).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={sort === key}
                    onClick={() => { setSort(key); setPage(1); }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 사이 간격은 review.css 의 .review-row + .review-row (10px) 가 잡습니다.
          여기에 flex gap 을 더 주면 두 값이 합쳐져 간격이 벌어집니다. */}
      <section aria-label="합격 후기 목록">
        {shown.map((r) => <ReviewRow key={r.id} review={r} />)}
        <Pagination current={current} total={totalPages} onChange={setPage} />
      </section>
    </div>
  );
}
