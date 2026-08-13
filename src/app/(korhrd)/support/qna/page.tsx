import type { Metadata } from 'next';

import { getMySupportQnaList } from '@/features/support-qna/services/support-qna.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { QnaBoard } from '../QnaBoard';

export const metadata: Metadata = {
  title: '1:1 문의 — 한평생 직업훈련',
  description: '한평생 직업훈련 1:1 문의',
};

/** 고객센터 › 1:1 문의. 문의 폼과 내 문의 내역을 함께 보여 줍니다. */
export default async function Page() {
  const member = await getMockableStudentMember();
  const items = member ? await getMySupportQnaList(member.id) : [];

  return (
    <QnaBoard items={items} isLoggedIn={member !== null} />
  );
}
