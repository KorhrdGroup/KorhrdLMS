/**
 * 자격증 취득 절차
 *
 * 프로토타입 원본: korhrd-site/process.html
 * ⚠ 이 파일은 마크업만 옮긴 상태입니다. 아래를 확인해 주세요.
 *   - 반복되는 목록은 data/*.ts 를 map() 으로 돌리도록 바꾸기
 *   - 상호작용(탭·아코디언·필터 등)은 components/ 의 공용 컴포넌트로 교체
 *   - class 이름은 그대로 두세요. styles/*.css 가 그 이름에 걸려 있습니다.
 */

import Link from 'next/link';

import ProcessFaq, { type ProcessFaqItem } from './ProcessFaq';

/* 아코디언 동작은 ProcessFaq(클라이언트)가 맡습니다.
   id 는 메인 화면의 링크(/process#p-faq-4 …)가 걸려 있어 바꾸면 안 됩니다.
   보이는 순서도 원본 그대로 4·5·6·1·2·3 입니다. */
const PROCESS_FAQS: ProcessFaqItem[] = [
  {
    id: 'p-faq-4',
    q: '수강료가 정말 0원인가요? 추가 비용은요?',
    a: (
      <>
        수강료와 시험 응시료는 0원입니다. 합격 후 자격증 실물 발급을 원하실 때만 발급비 100,000원이 발생하며, 이 금액에는 협회 자격증 발급비용과 택배비가 포함됩니다.
      </>
    ),
  },
  {
    id: 'p-faq-5',
    q: '수료 조건과 시험 기준이 어떻게 되나요?',
    a: (
      <>
        온라인 강의 출석률 60% 이상을 채우면 시험에 응시할 수 있고, 시험은 100점 만점에 60점 이상이면 합격입니다.
      </>
    ),
  },
  {
    id: 'p-faq-6',
    q: '자격증 발급까지 얼마나 걸리나요?',
    a: (
      <>
        교육 기간은 신청일로부터 6주이며, 합격 후 7일 이내에 발급을 신청하셔야 합니다. 배송은 신청일 다음 날부터 영업일 기준 최대 14일(휴일 제외) 소요됩니다.
      </>
    ),
  },
  {
    id: 'p-faq-1',
    q: '시험에 불합격하면 어떻게 되나요?',
    a: (
      <>
        교육 기간(6주) 내에서 재응시하실 수 있습니다. 다만 합격 후 7일이 지나면 해당 과목이 초기화되어 발급 신청이 불가하므로, 합격하신 뒤에는 기한 내에 발급을 신청해 주세요.
      </>
    ),
  },
  {
    id: 'p-faq-2',
    q: '발급받은 자격증은 어디에 활용할 수 있나요?',
    a: (
      <>
        자격증 취득 후 이력서 및 활용 기관에 정식으로 기재하실 수 있습니다. 다만 본 자격증은 한국직업능력연구원에 등록된 민간자격으로 국가공인 자격증이 아니므로, 채용 기관의 요구 조건을 미리 확인하시기 바랍니다.
      </>
    ),
  },
  {
    id: 'p-faq-3',
    q: '여러 과정을 동시에 수강할 수 있나요?',
    a: (
      <>
        가능합니다. 수강신청 페이지에서 원하는 과목을 여러 개 선택해 한 번에 신청하실 수 있습니다. 수강료는 과정 수와 관계없이 0원이며, 자격증 발급을 원하시는 과정에 대해서만 과정당 100,000원의 발급비가 발생합니다.
      </>
    ),
  },
];

export default function Page() {
  return (
    <>
      <div className="container">

          <nav className="breadcrumb" aria-label="현재 위치">
            <ol>
              <li><Link href="/">홈</Link></li>
              <li aria-current="page">취득 절차</li>
            </ol>
          </nav>

          <div className="page-head">
            <h1>자격증 취득 절차</h1>
          </div>
        </div>

        {/* 4단계 */}
        <section className="section" aria-label="자격증 취득 4단계">
          <div className="container">
            <ol className="content step-grid">
              <li className="step">
                <img className="step__ico" src="/step/1-apply.svg" alt="" aria-hidden="true" />
                <div className="step__head">
                  <h3>무료수강신청</h3>
                  <span className="step__dur">약 3분</span>
                </div>
                <p>원하는 과정들을 선택해 0원으로 신청합니다.</p>
              </li>
              <li className="step">
                <img className="step__ico" src="/step/2-learn.svg" alt="" aria-hidden="true" />
                <div className="step__head">
                  <h3>온라인 강의 수강</h3>
                  <span className="step__dur">6주 이내</span>
                </div>
                <p>PC·모바일로 약 20시간 강의를 수강합니다.</p>
              </li>
              <li className="step">
                <img className="step__ico" src="/step/3-exam.svg" alt="" aria-hidden="true" />
                <div className="step__head">
                  <h3>온라인 시험 응시</h3>
                  <span className="step__dur">60분</span>
                </div>
                <p>강의 수강 후 시험에 응시할 수 있습니다.</p>
              </li>
              <li className="step">
                <img className="step__ico" src="/step/4-cert.svg" alt="" aria-hidden="true" />
                <div className="step__head">
                  <h3>자격증 발급 신청</h3>
                  <span className="step__dur">배송 최대 14일</span>
                </div>
                <p>상장형·카드형 자격증으로 발급 가능합니다.</p>
              </li>
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
                <div className="req" style={{ background: '#fff' }}>
                  <p className="req__label">온라인 강의</p>
                  <p className="ring" style={{ '--pct': '60%' } as React.CSSProperties}><span>60%</span></p>
                  <p className="req__desc">전체 진도율 대비<br />60% 이상 수강</p>
                </div>
                <div className="req" style={{ background: '#fff' }}>
                  <p className="req__label">온라인 시험평가</p>
                  <p className="ring" style={{ '--pct': '60%' } as React.CSSProperties}><span>60점</span></p>
                  <p className="req__desc">100점 기준<br />평균 60점 이상</p>
                </div>
                <div className="req" style={{ background: '#fff' }}>
                  <p className="req__label">발급 신청 기한</p>
                  <p className="ring" style={{ '--pct': '100%' } as React.CSSProperties}><span>7일</span></p>
                  <p className="req__desc">합격 후 7일 이내<br />미신청 시 과목 초기화</p>
                </div>
                <div className="req" style={{ background: '#fff' }}>
                  <p className="req__label">수료 기간</p>
                  <p className="ring" style={{ '--pct': '100%' } as React.CSSProperties}><span>6주</span></p>
                  <p className="req__desc">신청일로부터<br />6주 과정</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 비용 안내 */}
        <section className="section" aria-labelledby="fee-title">
          <div className="container">
            <div className="section-head content">
              <h2 id="fee-title">비용 안내</h2>
              <p>수강과 시험까지는 비용이 없습니다. 자격증 실물 발급을 원하실 때만 발급비가 발생합니다.</p>
            </div>

            <div className="content">
              <ul className="summary">
                <li><span className="k">수강료</span><span className="v">0원 <del>300,000~400,000원</del></span></li>
                <li><span className="k">시험 응시료</span><span className="v">0원</span></li>
                <li><span className="k">강의 교안 · 기출 문제</span><span className="v">0원</span></li>
                <li className="is-total">
                  <span className="k">자격증 발급비 (선택)</span>
                  <span className="v">과정당 100,000원</span>
                </li>
              </ul>

              <p className="notice mt-4">
                <span>
                  발급비 <b>100,000원</b>에는 협회 자격증 발급비용과 택배비가 포함되며,
                  상장형과 카드형 자격증이 함께 발급됩니다.
                  집체교육을 진행하는 과정의 발급비는 <b>200,000원</b>입니다.
                  발급비는 신한은행 140-015-773620 (주)한평생그룹 계좌 입금 또는 카드 결제로 납부하실 수 있습니다.
                </span>
              </p>

              <table className="info-table mt-4">
                <caption className="sr-only">자격증 발급 및 배송 안내</caption>
                <tbody>
                  <tr><th scope="row">발급 형태</th><td>상장형 + 카드형 동시 발급</td></tr>
                  <tr><th scope="row">필요 서류</th><td>증명사진 (카드형 자격증에 첨부됩니다. 미첨부시 사진 없이 자격증만 발급)</td></tr>
                  <tr><th scope="row">배송 일정</th><td>매주 화요일 협회로 명단 전달 · 전달일로부터 1~2일 소요</td></tr>
                  <tr><th scope="row">자격관리기관</th><td>한국직업능력협회 (02-465-9568)</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section--alt" aria-labelledby="pfaq-title">
          <div className="container">
            <div className="section-head content">
              <h2 id="pfaq-title">자주 묻는 질문</h2>
            </div>

            <ProcessFaq items={PROCESS_FAQS} />
          </div>
        </section>

        <section className="cta-band">
          <h2>절차를 확인하셨다면, 이제 과정을 골라보세요</h2>
          <p>70여 개 정식 등록 민간자격 과정을 수강료 0원으로 시작할 수 있습니다.</p>
          <Link className="btn btn--white btn--lg" href="/courses">자격증 과정 보러 가기</Link>
        </section>
    </>
  );
}
