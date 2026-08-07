'use client';

import Link from 'next/link';
import { useCourseThumb } from '@/features/korhrd/lib/course-thumb-context';
import type { Course } from '@/features/korhrd/lib/types';
import GovMark from './GovMark';

const won = (n: number) => n.toLocaleString('ko-KR') + '원';

/**
 * 수강신청 목록의 과정 행 (Figma 330:7879).
 *
 * 클릭 규칙: 썸네일·과정명·"상세 정보" 버튼에서만 상세로 이동합니다.
 * 카드 전체를 링크로 두면 "과목 선택"·"강의 샘플"과 오인하기 쉬워 일부러 제외했습니다.
 */
export default function CourseRow({
  course, selected, onToggleSelect, onSample,
}: {
  course: Course;
  selected: boolean;
  onToggleSelect: () => void;
  onSample: () => void;
}) {
  const detail = `/courses/${encodeURIComponent(course.n)}`;
  const thumb = useCourseThumb(course);

  return (
    <article className="course-row">
      <Link className="course-row__thumb" href={detail} aria-label={`${course.n} 상세보기`}>
        {/* 썸네일은 어드민 과정관리에서 올린 이미지(courses.thumbnail_url)입니다.
            레이아웃이 DB에서 읽어 내려준 최신 값을 먼저 씁니다. */}
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" loading="lazy" />
        ) : (
          <div className="ph ph--thumb-sq">이미지<small>320 × 240</small></div>
        )}
        <GovMark ministry={course.g} tone="white" />
      </Link>

      <div className="course-row__head">
        <h2><Link href={detail}>{course.n}</Link></h2>
        {course.rank > 0 && <span className="badge badge--best">인기</span>}
        {course.year >= 2025 && <span className="badge badge--hot">신규</span>}
      </div>

      {/* 안내 문구는 스펙 표를 감추는 모바일에서만 보입니다 */}
      <p className="course-row__price">
        <span className="course-row__policy">교육원내 취업 장려 정책</span>
        <del>{won(course.price)}</del>
        <strong>0<span>원</span></strong>
      </p>

      <span className="course-row__rule" aria-hidden="true" />

      <div className="spec-table">
        <div><span className="label">담당교수</span><b>{course.prof}</b></div>
        <div><span className="label">수업방식</span><b>온라인</b></div>
        <div><span className="label">강의시간</span><b>약 {course.hours}시간</b></div>
        <div><span className="label">주무부처</span><b>{course.g}</b></div>
      </div>

      <div className="course-row__actions">
        {/* data-detail-link 는 CSS가 거는 자리입니다 — responsive.css 가
            560px 이하에서 이 속성으로 버튼을 감춥니다(썸네일·과정명으로 들어갑니다).
            빼면 좁은 화면에서도 버튼이 남아 카드가 그만큼 길어집니다. */}
        <Link className="btn btn--ghost btn--block" href={detail} data-detail-link>상세 정보</Link>
        <button className="btn btn--ghost btn--block" type="button" onClick={onSample}>강의 샘플</button>
        <button className="select-toggle" type="button" aria-pressed={selected} onClick={onToggleSelect}>
          과목 선택 <span className="select-toggle__box" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
