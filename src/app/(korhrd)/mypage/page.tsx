import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getMyProfile } from '@/features/members/services/member-profile.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import MyPageForm from './MyPageForm';

export const metadata: Metadata = {
  title: '회원정보 수정 — 한평생 직업훈련',
  robots: { index: false },
};

/**
 * 회원정보 수정.
 * 프로토타입 원본: korhrd-site/mypage-edit.html
 *
 * 원본은 값이 전부 고정된 마크업이었습니다. 지금은 로그인한 본인의 members
 * 레코드를 읽어 채우고, 저장은 세션에서 회원을 특정하는 서버 액션이 처리합니다.
 */
export default async function Page() {
  const member = await getMockableStudentMember();

  if (!member) {
    redirect('/login?redirect=/mypage');
  }

  const profile = await getMyProfile(member.id);

  if (!profile) {
    redirect('/login?redirect=/mypage');
  }

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/mylecture?tab=mypage">나의 강의실</Link></li>
          <li aria-current="page">회원정보 수정</li>
        </ol>
      </nav>

      <div className="page-head">
        <h1>회원정보 수정</h1>
      </div>

      <MyPageForm profile={profile} />

      <div className="guide-box">
        <strong>회원정보 안내</strong>
        <ul>
          <li>자격증은 등록된 주소로 배송되니 변경 시 미리 수정해 주세요</li>
          <li>이름은 자격증에 표기되므로 실명으로 입력해 주세요</li>
          <li>휴대폰 번호는 시험 일정·합격 안내 문자 수신에 사용됩니다</li>
          <li>
            비밀번호 변경은{' '}
            <Link href="/mypage/password" style={{ textDecoration: 'underline' }}>비밀번호 변경</Link>
            에서 하실 수 있습니다
          </li>
        </ul>
      </div>
    </div>
  );
}
