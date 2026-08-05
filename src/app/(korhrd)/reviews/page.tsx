import type { Metadata } from 'next';

import { listCourseReviews } from '@/features/korhrd/services/course-review.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import ReviewsClient from './ReviewsClient';

export const metadata: Metadata = { title: '합격후기 — 한평생 직업훈련' };

/** 합격후기 목록 — 데이터는 course_reviews 테이블에서 읽습니다. */
export default async function Page() {
  const member = await getMockableStudentMember();
  const reviews = await listCourseReviews({ viewerId: member?.id });
  return <ReviewsClient reviews={reviews} />;
}
