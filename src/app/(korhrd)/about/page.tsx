/**
 * 교육원 소개
 *
 * 프로토타입 원본: korhrd-site/about.html
 * ⚠ 이 파일은 마크업만 옮긴 상태입니다. 아래를 확인해 주세요.
 *   - 반복되는 목록은 data/*.ts 를 map() 으로 돌리도록 바꾸기
 *   - 상호작용(탭·아코디언·필터 등)은 components/ 의 공용 컴포넌트로 교체
 *   - class 이름은 그대로 두세요. styles/*.css 가 그 이름에 걸려 있습니다.
 */

import Link from 'next/link';
export default function Page() {
  return (
    <>
      <div className="container">
          <nav className="breadcrumb" aria-label="현재 위치"><ol><li><Link href="/">홈</Link></li><li aria-current="page">교육원 소개</li></ol></nav>
          <div className="page-head"><h1>교육원 소개</h1></div>
        </div>

        <section className="section section--navy" aria-label="비전">
          <div className="container">
            <div className="content text-center" style={{ padding: '20px 0' }}>
              <h2 style={{ color: '#fff', fontSize: '24px', lineHeight: '1.5', fontWeight: '700', textWrap: 'balance' }}>누구나 배우고 성장하여<br />새로운 일을 시작할 수 있는 사회를 만듭니다</h2>
            </div>
          </div>
        </section>

        <section className="section section--white" aria-labelledby="value-title">
          <div className="container">
            <div className="section-head content"><h2 id="value-title">한평생 직업훈련의 약속</h2></div>
            <div className="content step-grid">
              <div className="step" style={{ counterIncrement: 'none' }}><span className="ph ph--icon" aria-hidden="true"></span><h3>정식 등록 자격</h3><p>전 과정이 주무부처에 등록된 민간자격입니다. 등록번호를 직접 조회하실 수 있습니다.</p></div>
              <div className="step"><span className="ph ph--icon" aria-hidden="true"></span><h3>수강료 0원</h3><p>수강료와 응시료는 전액 무료입니다. 부담 없이 도전하실 수 있습니다.</p></div>
              <div className="step"><span className="ph ph--icon" aria-hidden="true"></span><h3>온라인 학습</h3><p>PC·모바일로 언제 어디서나 수강하고, 시험까지 온라인으로 완료합니다.</p></div>
              <div className="step"><span className="ph ph--icon" aria-hidden="true"></span><h3>발급까지 지원</h3><p>수강부터 자격증 발급·배송까지 전 과정을 책임지고 안내합니다.</p></div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="map-title">
          <div className="container">
            <div className="section-head content"><h2 id="map-title">오시는 길</h2></div>
            <div className="content">
              <div className="ph" style={{ width: '100%', height: '360px', borderRadius: '8px' }} aria-hidden="true">지도 영역<small>Google / Naver Map 임베드</small></div>
              <table className="info-table mt-4">
                <tbody>
                  <tr><th scope="row">주소</th><td>서울시 도봉구 창동 마들로13길 61 씨드큐브 905호</td></tr>
                  <tr><th scope="row">대표전화</th><td><a href="tel:0221359249">02-2135-9249</a></td></tr>
                  <tr><th scope="row">운영시간</th><td>평일 10:00~18:00 (점심 12:00~14:00) · 금/토/일/공휴일 휴무</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
    </>
  );
}
