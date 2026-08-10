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
    .select('login_id, name, birth_date, phone, email, address, address_detail, created_at')
    .eq('id', session.id)
    .maybeSingle();

  const data = await getMyLectureData(session.id);
  const [reviewable, allReviews] = await Promise.all([
    listReviewableCourses(session.id),
    listCourseReviews({ viewerId: session.id }),
  ]);
  const myReviews = allReviews.filter((review) => review.mine);

  return (
    // 탭 상태는 처음 한 번만 초기화됩니다. 이 화면에 있는 채로 헤더의 "○○ 님"
    // (=/mylecture?tab=mypage)을 누르면 주소만 바뀌고 탭은 그대로였습니다.
    // key 를 tab 으로 두면 주소가 바뀔 때 다시 그려져 해당 탭이 열립니다.
    <MyLectureClient
      key={tab ?? 'active'}
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
        birthDate: row?.birth_date ?? '',
        phone: row?.phone ?? '-',
        email: row?.email ?? '-',
        address: [row?.address, row?.address_detail].filter(Boolean).join(' ') || '-',
        joinedAt: row?.created_at?.slice(0, 10) ?? '-',
      }}
    />
  );
}
