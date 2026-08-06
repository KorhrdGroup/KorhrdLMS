import type { Metadata } from 'next';
import Link from 'next/link';

import { getMySupportQnaList } from '@/features/support-qna/services/support-qna.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import SupportFaq from './SupportFaq';
import { QnaBoard } from './QnaBoard';

export const metadata: Metadata = {
  title: '고객센터 — 한평생 직업훈련',
  description: '한평생 직업훈련 고객센터 1:1 문의',
};

/**
 * 고객센터.
 * 프로토타입 원본: korhrd-site/support.html — 상단 3블록·FAQ·문의폼 구성을 그대로 씁니다.
 * (문의 내역 목록만 우리 쪽에서 덧붙인 것입니다)
 */
export default async function Page() {
  const member = await getMockableStudentMember();
  const items = member ? await getMySupportQnaList(member.id) : [];

  return (
    <>
      <div className="container">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><Link href="/">홈</Link></li>
            <li aria-current="page">고객센터</li>
          </ol>
        </nav>

        <div className="page-head"><h1>고객센터</h1></div>

        <div className="support-grid">
          <div className="tel-box">
            <p className="tel-box__q">궁금한 점이 있으신가요?</p>
            <p className="tel-box__t">전화 상담 문의</p>
            <p className="tel-box__n"><a href="tel:0221359249">02-2135-9249</a></p>
            <p className="tel-box__h">
              운영시간 평일 10:00~18:00<br />
              점심시간 12:00~14:00 · 금/토/일/공휴일 휴무
            </p>
          </div>

          {/* 실시간 카카오톡 상담 배너 (Figma card_cs) */}
          <a className="kakao-box" href="https://pf.kakao.com/_NHfxfb" target="_blank" rel="noopener">
            <span className="kakao-box__txt">
              <span className="kakao-box__q">통화가 어려우신가요?</span>
              <span className="kakao-box__t">실시간 카카오톡 상담</span>
            </span>
            <span className="kakao-box__ico" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/kakao-bubble.png" alt="" />
            </span>
          </a>

          <a className="support-card" href="#form">
            <span className="ph ph--icon" aria-hidden="true" />
            <b>1:1 문의</b>
            <span>남겨주시면 순차적으로 답변드립니다</span>
          </a>
        </div>
      </div>

      <section className="section section--white" aria-labelledby="faq-title">
        <div className="container">
          <div className="section-head content"><h2 id="faq-title">자주 묻는 질문</h2></div>
          <div className="content">
            <SupportFaq />
          </div>
        </div>
      </section>

      <QnaBoard
        items={items}
        isLoggedIn={member !== null}
        defaultName={member?.name ?? ''}
      />
    </>
  );
}
