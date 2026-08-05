import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
  getCourseReview,
  listReviewableCourses,
} from '@/features/korhrd/services/course-review.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';
import { createClient } from '@/lib/supabase/server';

import { ReviewWriteForm } from './ReviewWriteForm';

export const metadata: Metadata = { title: '합격후기 작성 — 한평생 직업훈련' };

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const member = await getMockableStudentMember();
  if (!member) {
    redirect('/login?redirect=/reviews/write');
  }

  const courses = await listReviewableCourses(member.id);

  let initial: React.ComponentProps<typeof ReviewWriteForm>['initial'];
  if (id) {
    const review = await getCourseReview(id, member.id);
    // 본인 글이 아니면 수정 화면을 열지 않습니다.
    if (!review || !review.mine) redirect('/reviews');

    // 화면은 과정 id로 다루므로 이름 → id 로 되돌립니다.
    const supabase = await createClient();
    const { data: row } = await supabase
      .from('course_reviews')
      .select('course_id, also_course_ids')
      .eq('id', id)
      .maybeSingle();

    initial = {
      id: review.id,
      courseId: row?.course_id ?? '',
      title: review.title,
      body: review.body,
      alsoCourseIds: row?.also_course_ids ?? [],
    };
  }

  return <ReviewWriteForm courses={courses} initial={initial} />;
}
