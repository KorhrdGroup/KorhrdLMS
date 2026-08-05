import type { Metadata } from 'next';

import { FindAccountForm } from './FindAccountForm';

export const metadata: Metadata = {
  title: '아이디·비밀번호 찾기 — 한평생 직업훈련',
  description: '한평생 직업훈련 아이디 및 비밀번호 찾기',
};

export default function Page() {
  return <FindAccountForm />;
}
