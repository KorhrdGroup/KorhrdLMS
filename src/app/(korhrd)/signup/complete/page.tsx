import type { Metadata } from 'next';
import Link from 'next/link';

import { COURSES } from '@/features/korhrd/data/courses';
import KarrotTrackOnce from '@/features/korhrd/components/KarrotTrackOnce';

export const metadata: Metadata = {
  title: '회원가입 완료 — 한평생 직업훈련',
  robots: { index: false },
};

/**
 * 회원가입 완료.
 * 프로토타입 원본: korhrd-site/join-complete.html
 *
 * 원본의 "70여 개 과정"은 고정 문구였습니다. 수강신청 목록과 같은 출처
 * (features/korhrd/data/courses.ts — DB 동기화 스냅샷)를 세어 실제 개수를 씁니다.
 */
export default function Page() {
  const courseCount = COURSES.length;

  return (
    <>
    <KarrotTrackOnce event="CompleteRegistration" />
    <div className="container">
      <div className="auth-wrap">
        <div className="complete" style={{ paddingTop: 40 }}>
          <p className="complete__mark" aria-hidden="true">✓</p>
          <h1>회원가입이 완료됐어요</h1>
          <p className="complete__sub">
            이제 {courseCount}개 과정을 수강료 0원으로 신청하실 수 있습니다.
          </p>
          <div style={{ display: 'grid', gap: 8 }}>
            <Link className="btn btn--primary btn--lg btn--block" href="/courses">
              자격증 과정 보러 가기
            </Link>
            <Link className="btn btn--ghost btn--block" href="/login">로그인하기</Link>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
