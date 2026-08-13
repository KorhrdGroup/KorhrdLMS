import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '취득 과정 — 한평생 직업훈련',
  description: '자격증 취득 4단계와 수료 · 합격 기준',
};

/** 자격증 취득 4단계 — 없어진 취득 절차 화면(korhrd-site/process.html)에 있던 것입니다 */
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

/** 고객센터 › 취득 과정 (2026-08-12, 디자인 요청으로 이 자리에 들어왔습니다) */
export default function Page() {
  return (
    <>
      <section>
        <div className="section-head">
          <h2>자격증 취득, 4단계면 됩니다</h2>
          <p>신청부터 발급까지 전 과정 온라인 · 교육기간 6주</p>
        </div>
        <ol className="step-grid">
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
      </section>

      <section className="mt-7">
        <div className="section-head">
          <h2>수료 · 합격 기준</h2>
          <p>아래 네 가지 조건만 충족하면 자격증을 받으실 수 있습니다.</p>
        </div>
        <div className="req-grid">
          {REQUIREMENTS.map((r) => (
            <div className="req" key={r.label}>
              <p className="req__label">{r.label}</p>
              <p className="ring" style={{ '--pct': r.pct } as React.CSSProperties}><span>{r.value}</span></p>
              <p className="req__desc">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
