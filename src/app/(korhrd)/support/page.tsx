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

/** 자격증 취득 4단계 — 취득 절차 화면(korhrd-site/process.html)에 있던 것입니다 */
const STEPS = [
  { ico: '/step/1-apply.svg', title: '무료수강신청', dur: '약 3분', desc: '원하는 과정들을 선택해 0원으로 신청합니다.' },
  { ico: '/step/2-learn.svg', title: '온라인 강의 수강', dur: '6주 이내', desc: 'PC·모바일로 약 20시간 강의를 수강합니다.' },
  { ico: '/step/3-exam.svg', title: '온라인 시험 응시', dur: '60분', desc: '강의 수강 후 시험에 응시할 수 있습니다.' },
  { ico: '/step/4-cert.svg', title: '자격증 발급 신청', dur: '배송 최대 14일', desc: '상장형·카드형 자격증으로 발급 가능합니다.' },
];

/** 수료 · 합격 기준 — 같은 화면에 있던 네 가지 조건입니다 */
const REQUIREMENTS = [
  { label: '온라인 강의', pct: '60%', value: '60%', desc: <>전체 진도율 대비<br />60% 이상 수강</> },
  { label: '온라인 시험평가', pct: '60%', value: '60점', desc: <>100점 기준<br />평균 60점 이상</> },
  { label: '발급 신청 기한', pct: '100%', value: '7일', desc: <>합격 후 7일 이내<br />미신청 시 과목 초기화</> },
  { label: '수료 기간', pct: '100%', value: '6주', desc: <>신청일로부터<br />6주 과정</> },
];

/**
 * 고객센터.
 * 프로토타입 원본: korhrd-site/support.html — 상단 3블록·FAQ·문의폼 구성을 그대로 씁니다.
 * (문의 내역 목록만 우리 쪽에서 덧붙인 것입니다)
 *
 * 2026-08-12 — 취득 절차 화면(/process)을 없애면서 그 내용을 여기로 합쳤습니다.
 * 4단계와 수료·합격 기준이 FAQ 위로 들어오고, 그 화면의 FAQ 중 여기에 없던 두
 * 문항은 SupportFaq 에 합쳤습니다. '어떻게 받나' 를 묻는 자리가 여기 하나로
 * 모였습니다.
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

      {/* 자격증 취득 4단계 */}
      <section className="section section--white" aria-labelledby="step-title">
        <div className="container">
          <div className="section-head content">
            <h2 id="step-title">자격증 취득, 4단계면 됩니다</h2>
            <p>신청부터 발급까지 전 과정 온라인 · 교육기간 6주</p>
          </div>
          <ol className="content step-grid">
            {STEPS.map((s) => (
              <li className="step" key={s.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="step__ico" src={s.ico} alt="" aria-hidden="true" />
                <div className="step__head">
                  <h3>{s.title}</h3>
                  <span className="step__dur">{s.dur}</span>
                </div>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 수료 · 합격 기준 */}
      <section className="section section--alt" aria-labelledby="req-title">
        <div className="container">
          <div className="section-head content">
            <h2 id="req-title">수료 · 합격 기준</h2>
            <p>아래 네 가지 조건만 충족하면 자격증을 받으실 수 있습니다.</p>
          </div>
          <div className="content">
            <div className="req-grid">
              {REQUIREMENTS.map((r) => (
                <div className="req" style={{ background: '#fff' }} key={r.label}>
                  <p className="req__label">{r.label}</p>
                  <p className="ring" style={{ '--pct': r.pct } as React.CSSProperties}><span>{r.value}</span></p>
                  <p className="req__desc">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
