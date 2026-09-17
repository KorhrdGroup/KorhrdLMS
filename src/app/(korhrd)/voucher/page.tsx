import type { Metadata } from 'next';
import Link from 'next/link';

import { getMockableStudentMember } from '@/lib/mock-auth-server';

import VoucherPayForm from './VoucherPayForm';

export const metadata: Metadata = {
  title: '평생교육이용권 결제 — 한평생 직업훈련',
  robots: { index: false },
};

/** 평생교육이용권 결제 — 나이스페이 결제창으로 결제합니다. 로그인 없이도 가능(비회원은 이름·휴대폰 입력). */
export default async function Page() {
  const member = await getMockableStudentMember();

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/support">고객센터</Link></li>
          <li aria-current="page">평생교육이용권 결제</li>
        </ol>
      </nav>

      <div className="page-head"><h1>평생교육이용권 결제</h1></div>

      <VoucherPayForm member={member ? { name: member.name } : null} />
    </div>
  );
}
