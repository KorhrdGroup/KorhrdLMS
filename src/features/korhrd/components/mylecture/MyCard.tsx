'use client';

import Link from 'next/link';
import type { Enrollment } from '@/features/korhrd/lib/types';
import { cardStatus, MAX_EXTEND } from '@/features/korhrd/lib/myStatus';

/** 강의실 입장 버튼의 재생 아이콘 */
const PlayIcon = () => (
  <svg className="btn__ico" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="currentColor" />
    <path d="M6 4.5v7l5.5-3.5z" fill="#fff" />
  </svg>
);

/**
 * 나의 강의실 과정 카드.
 * 배지·문구·버튼 활성 여부는 전부 lib/myStatus.ts 가 정합니다 — 여기서는 그리기만 합니다.
 *
 * 비활성 버튼은 <button disabled> 가 아니라 <span aria-disabled> 입니다.
 * 원래 자리에 링크가 오는 칸이라 크기를 맞추려고 그렇게 두었습니다.
 */
export default function MyCard({ enrollment, courseCode, extendCount = 0, onExtend }: {
  enrollment: Enrollment;
  /** 강의실 입장 링크에 쓰는 과정코드(CRS-KH-xxxx). 없으면 버튼을 비활성으로 둡니다 */
  courseCode?: string;
  extendCount?: number;
  onExtend?: (course: string) => void;
}) {
  const s = cardStatus(enrollment, extendCount);
  const ended = enrollment.status === 'expired' || enrollment.status === 'issued';

  return (
    <article className="my-card">
      <div>
        <div className="my-card__head">
          <h2>{enrollment.course}</h2>
          <span className={`badge badge--${s.badge.tone}`}>{s.badge.label}</span>
        </div>
        <p className="my-card__date">
          <time dateTime={enrollment.startDate}>{enrollment.startDate}</time>
          {' ~ '}
          <time dateTime={enrollment.endDate}>{enrollment.endDate}</time>
        </p>
        <p className="progress">
          <span className="progress__bar"><i style={{ width: `${enrollment.progress}%` }} /></span>
          <span className="progress__value">진도율<b>{enrollment.progress}%</b></span>
        </p>
        {s.message && <p className={`my-card__status my-card__status--${s.tone}`}>{s.message}</p>}
      </div>

      <div className="my-card__actions">
        {/* 발급 완료 과정은 강의실에 들어갈 일이 없습니다 */}
        {enrollment.status !== 'issued' && (
          courseCode ? (
            <Link className="btn btn--ghost btn--block" href={`/lecture/${courseCode}`}>
              강의실 입장 <PlayIcon />
            </Link>
          ) : (
            <span className="btn btn--block" aria-disabled="true">강의실 입장</span>
          )
        )}

        {courseCode ? (
          /* 응시 이력이 있으면 시험 목록이 아니라 성적 확인 화면으로 바로 보냅니다 */
          <Link
            className="btn btn--ghost btn--block"
            href={enrollment.score !== undefined ? `/exam/${courseCode}/result` : `/exam/${courseCode}`}
          >
            {enrollment.score !== undefined ? '시험성적 확인' : '시험 응시하기'}
          </Link>
        ) : !ended ? (
          <span className="btn btn--block" aria-disabled="true">시험 응시하기</span>
        ) : null}

        {enrollment.status === 'issued' ? (
          <Link className="btn btn--primary btn--block" href="/certificate/status">발급 내역 보기</Link>
        ) : s.canIssue ? (
          <Link
            className="btn btn--primary btn--block"
            href={`/certificate?course=${encodeURIComponent(enrollment.course)}`}
          >
            자격증 발급 신청
          </Link>
        ) : s.canExtend ? (
          <button className="btn btn--primary btn--block" type="button" onClick={() => onExtend?.(enrollment.course)}>
            기간 연장
          </button>
        ) : ended ? (
          <span className="btn btn--block" aria-disabled="true">
            기간 연장 ({extendCount}/{MAX_EXTEND})
          </span>
        ) : (
          <span className="btn btn--block" aria-disabled="true">자격증 발급 신청</span>
        )}
      </div>
    </article>
  );
}
