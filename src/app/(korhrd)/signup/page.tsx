import type { Metadata } from 'next';

import { SignupForm } from './SignupForm';

export const metadata: Metadata = {
  title: '회원가입 — 한평생 직업훈련',
  description: '한평생 직업훈련 회원가입',
};

export default function Page() {
  return <SignupForm />;
}
