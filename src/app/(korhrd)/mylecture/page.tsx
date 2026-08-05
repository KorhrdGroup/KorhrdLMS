import { redirect } from 'next/navigation';

import { getMyLectureData } from '@/features/korhrd/lib/my-lecture-data';
import {
  listCourseReviews,
  listReviewableCourses,
} from '@/features/korhrd/services/course-review.service';
import { createClient } from '@/lib/supabase/server';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import MyLectureClient from './MyLectureClient';

/** 나의 강의실 — 수강내역·회원정보를 DB에서 읽어 화면에 넘깁니다. */
type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;

  const session = await getMockableStudentMember();
  if (!session) {
    redirect('/login?redirect=/mylecture');
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from('members')
    .select('login_id, name, phone, email, address, address_detail, created_at')
    .eq('id', session.id)
    .maybeSingle();

  const data = await getMyLectureData(session.id);
  const [reviewable, allReviews] = await Promise.all([
    listReviewableCourses(session.id),
    listCourseReviews({ viewerId: session.id }),
  ]);
  const myReviews = allReviews.filter((review) => review.mine);

  return (
    <MyLectureClient
      initialTab={tab}
      active={data.active}
      ended={data.ended}
      pending={data.pending}
      courseCodeByName={data.courseCodeByName}
      reviewable={reviewable}
      myReviews={myReviews}
      member={{
        id: row?.login_id ?? session.loginId,
        name: row?.name ?? session.name,
        phone: row?.phone ?? '-',
        email: row?.email ?? '-',
        address: [row?.address, row?.address_detail].filter(Boolean).join(' ') || '-',
        joinedAt: row?.created_at?.slice(0, 10) ?? '-',
      }}
    />
  );
}
