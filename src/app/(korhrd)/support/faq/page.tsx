import type { Metadata } from 'next';

import SupportFaq from '../SupportFaq';

export const metadata: Metadata = {
  title: '자주 묻는 질문 — 한평생 직업훈련',
  description: '한평생 직업훈련 자주 묻는 질문',
};

/** 고객센터 › 자주 묻는 질문. 분류 토글과 아코디언은 SupportFaq 가 가집니다. */
export default function Page() {
  return (
    <section>
      <div className="section-head"><h2>자주 묻는 질문</h2></div>
      <SupportFaq />
    </section>
  );
}
