import Link from 'next/link';
import type { Course } from '@/features/korhrd/lib/types';
import GovMark from './GovMark';

/** 메인 "어떤 목적으로 자격증을 찾으세요?"의 과정 카드 (그리드형) */
export default function CourseCard({ course }: { course: Course }) {
  return (
    <article className="course-card">
      <Link href={`/courses/${encodeURIComponent(course.n)}`}>
        <div className="thumb">
          {/* 썸네일은 어드민 과정관리에서 올린 이미지(courses.thumbnail_url)입니다.
              아직 없는 과정은 기존 자리표시를 그대로 보여줍니다. */}
          {course.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumb} alt="" loading="lazy" />
          ) : (
            <div className="ph ph--thumb">이미지 영역<small>480 × 285</small></div>
          )}
          <GovMark ministry={course.g} tone="white" />
        </div>
        <div className="course-card__body">
          <h4 className="course-card__title">{course.n}</h4>
          <p className="course-card__badges">
            {course.rank > 0 && course.rank <= 3 && <span className="badge badge--best">인기</span>}
            <span className="badge badge--free">무료수강권</span>
            <span className="badge badge--age">{course.ap} 추천</span>
          </p>
          <p className="price">
            <del>{course.price.toLocaleString('ko-KR')}원</del>
            <strong>0원</strong>
          </p>
        </div>
      </Link>
    </article>
  );
}
