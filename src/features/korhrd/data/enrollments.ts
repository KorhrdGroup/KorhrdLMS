import type { Enrollment } from '@/features/korhrd/lib/types';

/**
 * 나의 강의실 샘플 수강 내역.
 *
 * 여기에는 "사실"만 담습니다 — 진도율·점수·기간·연장 횟수.
 * 화면에 보이는 배지와 안내 문구는 lib/myStatus.ts 가 이 값에서 계산합니다.
 * (문구를 데이터에 적어두면 규칙이 바뀔 때마다 데이터를 고쳐야 합니다)
 *
 * course 값은 data/courses.ts 의 Course.n 과 일치해야 합니다.
 */
export const ENROLLMENTS: Enrollment[] = [
  /* --- 수강중 (endDate 가 오늘 이후) --- */
  {
    course: '노인돌봄생활지원사 1급',
    passedAt: '2026-04-20',
    status: 'pass',
    progress: 100,
    startDate: '2026-03-10',
    endDate: '2026-04-20',
    score: 80,
    issueDeadline: '2026-04-27',
  },
  {
    course: '베이비시터 1급',
    passedAt: '2026-04-25',
    status: 'pass',
    progress: 100,
    startDate: '2026-03-15',
    endDate: '2026-04-25',
    score: 92,
    issueDeadline: '2026-05-02',
  },
  {
    course: '노인심리상담사 1급',
    status: 'fail',
    progress: 100,
    startDate: '2026-03-10',
    endDate: '2026-04-20',
    score: 55,
  },
  {
    course: '방과후학교지도사 1급',
    status: 'ready',
    progress: 70,
    startDate: '2026-03-10',
    endDate: '2026-04-20',
  },
  {
    course: '도시농업전문가 1급',
    status: 'learning',
    progress: 35,
    startDate: '2026-03-10',
    endDate: '2026-04-20',
  },

  /* --- 수강종료 --- */
  {
    course: '반려동물관리사',
    passedAt: '2025-12-10',
    status: 'issued',
    progress: 100,
    startDate: '2025-11-02',
    endDate: '2025-12-14',
    score: 88,
  },
  {
    course: 'SNS마케팅전문가',
    status: 'expired',
    progress: 45,
    startDate: '2025-12-01',
    endDate: '2026-01-12',
  },
  {
    course: '심리상담사 1급',
    status: 'expired',
    progress: 100,
    startDate: '2025-11-20',
    endDate: '2026-01-01',
    score: 52,
  },
  {
    course: '바리스타 1급',
    passedAt: '2025-11-20',
    status: 'expired',
    progress: 100,
    startDate: '2025-10-15',
    endDate: '2025-11-26',
    score: 85,
  },
  {
    course: '독서지도사 1급',
    status: 'expired',
    progress: 80,
    startDate: '2025-08-01',
    endDate: '2025-09-12',
  },
];

/** 과정별 수강기간 연장 횟수 (최대 5회) — 실서비스에서는 Enrollment 에 합치세요 */
export const EXTEND_COUNT: Record<string, number> = {
  'SNS마케팅전문가': 0,
  '바리스타 1급': 1,
  '심리상담사 1급': 2,
  '독서지도사 1급': 5,
};

/** 수강중 탭 — endDate 가 지나지 않은 과정 */
export const ACTIVE = ENROLLMENTS.filter((e) => e.status !== 'expired' && e.status !== 'issued');

/** 수강종료 탭 */
export const ENDED = ENROLLMENTS.filter((e) => e.status === 'expired' || e.status === 'issued');

/** 합격후기를 쓸 수 있는 과정 — 탭과 무관하게 '합격한 과정'이면 모두 */
export const PASSED = ENROLLMENTS.filter(
  (e) => e.status === 'pass' || e.status === 'issued' || (e.score !== undefined && e.score >= 60),
);
