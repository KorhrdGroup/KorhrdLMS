import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getMockableStudentMember } from '@/lib/mock-auth-server';

import PasswordChangeForm from './PasswordChangeForm';

export const metadata: Metadata = {
  title: '비밀번호 변경 — 한평생 직업훈련',
  robots: { index: false },
};

/**
 * 비밀번호 변경.
 * 프로토타입 원본: korhrd-site/password-change.html
 *
 * 학생 인증은 members.password_hash(scrypt) + httpOnly 쿠키라, 현재 비밀번호
 * 확인과 재해싱을 모두 서버 액션에서 처리합니다.
 */
export default async function Page() {
  const member = await getMockableStudentMember();

  if (!member) {
    redirect('/login?redirect=/mypage/password');
  }

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/mylecture?tab=mypage">나의 강의실</Link></li>
          <li aria-current="page">비밀번호 변경</li>
        </ol>
      </nav>

      <div className="auth-wrap">
        <div className="page-head">
          <h1>비밀번호 변경</h1>
        </div>

        <PasswordChangeForm />

        <div className="guide-box">
          <strong>비밀번호 안내</strong>
          <ul style={{ gridTemplateColumns: '1fr' }}>
            <li>비밀번호는 4~20자로 설정해 주세요</li>
            <li>현재 비밀번호와 다른 비밀번호로 설정해 주세요</li>
            <li>
              비밀번호가 기억나지 않으면{' '}
              <Link href="/find" style={{ textDecoration: 'underline' }}>비밀번호 찾기</Link>
              를 이용해 주세요
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
