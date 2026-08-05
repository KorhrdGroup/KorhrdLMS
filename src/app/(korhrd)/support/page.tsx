import type { Metadata } from 'next';

import { getMySupportQnaList } from '@/features/support-qna/services/support-qna.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { QnaBoard } from './QnaBoard';

export const metadata: Metadata = {
  title: '고객센터 — 한평생 직업훈련',
  description: '한평생 직업훈련 고객센터 1:1 문의',
};

/** 고객센터 — 마크업은 korhrd 디자인, 문의 내역은 기존 support-qna 서비스. */
export default async function Page() {
  const member = await getMockableStudentMember();
  const items = member ? await getMySupportQnaList(member.id) : [];

  return <QnaBoard items={items} isLoggedIn={member !== null} />;
}
