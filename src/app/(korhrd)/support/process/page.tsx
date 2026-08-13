import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '취득 과정 — 한평생 직업훈련',
  description: '자격증 취득 4단계와 수료 · 합격 기준',
};

/** 자격증 취득 4단계 — 없어진 취득 절차 화면(korhrd-site/process.html)에 있던 것입니다 */
const STEPS = [
  { ico: '/step/1-apply.svg', title: '무료수강신청', dur: '약 3분', desc: <>원하는 과정들을 선택해<br />0원으로 신청합니다.</> },
  { ico: '/step/2-learn.svg', title: '온라인 강의 수강', dur: '6주 이내', desc: <>PC·모바일로 약 20시간<br />강의를 수강합니다.</> },
  { ico: '/step/3-exam.svg', title: '온라인 시험 응시', dur: '60분', desc: <>강의 수강 후 시험에<br />응시할 수 있습니다.</> },
  { ico: '/step/4-cert.svg', title: '자격증 발급 신청', dur: '배송 최대 14일', desc: <>상장형·카드형 자격증으로<br />발급 가능합니다.</> },
];

/** 수료 · 합격 기준 — 링 네 개 대신 가로 막대 둘로 풉니다 (2026-08-13, 디자인 요청).
 *
 * ① 응시 자격: 출석 60% 지점까지 채워진 막대 — "여기까지만 들으면 된다"
 * ② 합격 점수: 출석 40점 + 시험 60점을 한 막대에 쌓고 60점 자리에 합격선 —
 *    출석만으로 합격선의 3분의 2가 채워지는 게 눈에 보입니다.
 * 발급 신청 7일·교육 기간 6주 링은 뺐습니다(FAQ 가 안내합니다).
 *
 * 근거는 모두 실제 규칙입니다 — 합격 판정은 출석 40% + 시험 60% 가중 합산
 * 총점 60점 이상(grades/lib/grade-calculator.ts — 학생 성적 화면·관리자
 * 성적관리가 공유), 진도 60% = 응시 자격, 시험은 객관식, 불합격 시 6주 안에
 * 재응시 가능하고 최신 점수만 남습니다(classroom-exam.service). */

/** 그래프 밑에 붙는 안심 문단 — 막대가 말한 것(점수 구성)은 반복하지 않습니다 */
const REASSURANCES = [
  '시험은 객관식이고, 강의에서 다룬 범위 안에서만 출제됩니다. 강의를 들으셨다면 충분히 풀 수 있는 수준입니다.',
  '한 번에 합격하지 못해도 괜찮습니다. 교육 기간(6주) 안에는 다시 응시할 수 있고, 기록에는 최신 점수만 남습니다.',
  '시험은 60분 동안 PC·모바일로 언제 어디서든 응시할 수 있습니다.',
  '합격하신 뒤 7일 안에 발급을 신청하시면 됩니다.',
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
          <p>출석과 시험, 어렵지 않게 정리했어요.</p>
        </div>
        <div className="pass-viz">
          {/* ① 응시 자격 — 출석 60% 지점까지 채워진 막대 */}
          <div className="pass-viz__row">
            <div className="pass-viz__head">
              <b>시험 응시 자격</b>
              <span>강의 출석 <b>60%</b></span>
            </div>
            <div className="pass-bar" role="img" aria-label="전체 강의의 60%를 들으면 시험에 응시할 수 있습니다">
              <i className="pass-bar__seg pass-bar__seg--att" style={{ width: '60%' }}>출석 60%</i>
              <span className="pass-bar__rest">전체 강의</span>
            </div>
            <p className="pass-viz__note">
              강의 수강률 60%를 넘기면 시험 응시가 바로 가능하며, 수강률에 따라 출석점수가 달라집니다.(40점 만점)
            </p>
          </div>

          {/* ② 합격 점수 — 출석 40 + 시험 60 을 한 막대에 쌓고 60점 자리에 합격선 */}
          <div className="pass-viz__row">
            <div className="pass-viz__head">
              <b>합격 점수</b>
              <span>총점 <b>60점</b> 이상</span>
            </div>
            <div
              className="pass-bar"
              role="img"
              aria-label="출석 점수 최대 40점과 시험 점수 최대 60점을 합쳐 총점 60점 이상이면 합격입니다"
            >
              <i className="pass-bar__seg pass-bar__seg--att" style={{ width: '40%' }}>출석 40점</i>
              <i className="pass-bar__seg pass-bar__seg--exam" style={{ width: '60%' }}>시험 60점</i>
              <span className="pass-bar__line" style={{ left: '60%' }} data-label="합격선 60점" aria-hidden="true" />
            </div>
            <p className="pass-viz__note">
              합격 점수의 40%는 출석점수이며, 시험 점수는 60%를 차지합니다.
              출석과 시험 점수를 합해, 총점 60점이 넘으면 합격이 가능합니다.
            </p>
          </div>
        </div>

        <div className="guide-box">
          <strong>그래도 걱정되시나요?</strong>
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
