import { redirect } from 'next/navigation';

import { getMyLectureData } from '@/features/korhrd/lib/my-lecture-data';
import {
  listCourseReviews,
  listReviewableCourses,
} from '@/features/korhrd/services/course-review.service';
import { createClient } from '@/lib/supabase/server';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import MyLectureClient from './MyLectureClient';
import PartnerCodeWelcomeModal from '@/features/korhrd/components/mylecture/PartnerCodeWelcomeModal';
import KarrotTrackOnce from '@/features/korhrd/components/KarrotTrackOnce';

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
    .select('login_id, name, birth_date, phone, email, address, address_detail, created_at, partner_code')
    .eq('id', session.id)
    .maybeSingle();

  const data = await getMyLectureData(session.id);

  // 소셜 가입 직후(콜백이 ?welcome=social 로 보냄) + 아직 코드가 없으면 파트너스 코드 팝업
  const welcome = Array.isArray(params.welcome) ? params.welcome[0] : params.welcome;
  const askPartnerCode = welcome === 'social' && !row?.partner_code;

  // [임시 미리보기] ?preview=fail 로 열면 수강중 카드를 불합격 상태로 바꿔 보여줍니다.
  // 디자인 확인용이며, 파라미터 없이 열면 실제 데이터 그대로입니다.
  const preview = Array.isArray(params.preview) ? params.preview[0] : params.preview;
  if (preview === 'fail') {
    data.active = data.active.map((e) => ({ ...e, status: 'fail' as const, score: 52 }));
  }
  const [reviewable, allReviews] = await Promise.all([
    listReviewableCourses(session.id),
    listCourseReviews({ viewerId: session.id }),
  ]);
  const myReviews = allReviews.filter((review) => review.mine);

  return (
    // 탭 상태는 처음 한 번만 초기화됩니다. 이 화면에 있는 채로 헤더의 "○○ 님"
    // (=/mylecture?tab=mypage)을 누르면 주소만 바뀌고 탭은 그대로였습니다.
    // key 를 tab 으로 두면 주소가 바뀔 때 다시 그려져 해당 탭이 열립니다.
    <>
    {welcome === 'social' ? <KarrotTrackOnce event="CompleteRegistration" /> : null}
    {askPartnerCode ? <PartnerCodeWelcomeModal /> : null}
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
    </>
  );
}
