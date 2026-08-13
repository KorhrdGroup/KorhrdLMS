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

/** 수료 · 합격 기준 — 같은 화면에 있던 네 가지 조건입니다.
 *
 * 숫자는 그대로 두되 설명은 "채워야 할 관문" 이 아니라 "이 정도면 된다" 로
 * 읽히게 적습니다 (2026-08-13, 디자인 요청). 근거는 모두 실제 규칙입니다 —
 * 진도 60% = 응시 자격, 시험은 객관식(classroom-exam.types 의 choices),
 * 불합격 시 6주 안에 재응시 가능하고 최신 점수만 남습니다
 * (classroom-exam.service startExamRetake). 출석 점수 합산 같은, 시스템에
 * 없는 규칙은 적지 않습니다. */
const REQUIREMENTS = [
  { label: '온라인 강의', pct: '60%', value: '60%', desc: <>전체 강의의 60%만 들으면<br />시험을 보실 수 있습니다</> },
  { label: '온라인 시험', pct: '60%', value: '60점', desc: <>객관식 · 강의에서 다룬<br />내용에서 출제됩니다</> },
  { label: '발급 신청', pct: '100%', value: '7일', desc: <>합격하시면 7일 안에<br />발급을 신청해 주세요</> },
  { label: '교육 기간', pct: '100%', value: '6주', desc: <>이 안에는 몇 번이든<br />다시 응시할 수 있습니다</> },
];

/** 숫자 밑에 붙는 안심 문단 — 네 숫자가 왜 부담이 아닌지 풀어 줍니다 */
const REASSURANCES = [
  '시험은 객관식이고, 강의에서 다룬 범위 안에서만 출제됩니다. 강의를 들으셨다면 충분히 풀 수 있는 수준입니다.',
  '강의를 처음부터 끝까지 다 들어야 하는 것도 아닙니다. 전체의 60%만 수강하면 응시 자격이 생깁니다.',
  '한 번에 합격하지 못해도 괜찮습니다. 교육 기간 안에는 다시 응시할 수 있고, 기록에는 최신 점수만 남습니다.',
  '시험은 60분 동안 PC·모바일로 언제 어디서든 응시할 수 있습니다.',
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
          <p>숫자만 보면 시험 같지만, 강의를 꾸준히 들으셨다면 무리 없이 넘는 기준입니다.</p>
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

        <div className="guide-box">
          <strong>막상 해보면 어렵지 않습니다</strong>
          <ul>
            {REASSURANCES.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
