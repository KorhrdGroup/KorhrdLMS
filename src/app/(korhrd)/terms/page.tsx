/**
 * 이용약관
 *
 * 프로토타입 원본: korhrd-site/terms.html
 * ⚠ 이 파일은 마크업만 옮긴 상태입니다. 아래를 확인해 주세요.
 *   - 반복되는 목록은 data/*.ts 를 map() 으로 돌리도록 바꾸기
 *   - 상호작용(탭·아코디언·필터 등)은 components/ 의 공용 컴포넌트로 교체
 *   - class 이름은 그대로 두세요. styles/*.css 가 그 이름에 걸려 있습니다.
 */

import Link from 'next/link';
export default function Page() {
  return (
    <div className="container">
        <nav className="breadcrumb" aria-label="현재 위치"><ol><li><Link href="/">홈</Link></li><li aria-current="page">이용약관</li></ol></nav>
        <div className="page-head"><h1>이용약관</h1></div>
        <div className="policy card">
          <section className="policy-sec">
            <h2>제1조 (목적)</h2>
            <p>이 약관은 회사가 운영하는 온라인 자격 교육 서비스(이하 “서비스”)의 이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>
          <section className="policy-sec">
            <h2>제2조 (정의)</h2>
            <ul className="policy-list"><li>“회원”이란 이 약관에 동의하고 회사와 이용계약을 체결한 자를 말합니다.</li><li>“수강”이란 회원이 서비스에서 제공하는 온라인 강의를 신청하여 학습하는 것을 말합니다.</li><li>“자격증 발급”이란 수료·합격 후 회원의 신청에 따라 민간자격증을 발급하는 것을 말합니다.</li></ul>
          </section>
          <section className="policy-sec">
            <h2>제3조 (약관의 효력 및 변경)</h2>
            <p>이 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 및 사유를 명시하여 최소 7일 전에 공지합니다.</p>
          </section>
          <section className="policy-sec">
            <h2>제4조 (수강료 및 자격증 발급비용)</h2>
            <p>서비스의 수강료와 시험 응시료는 무료(0원)입니다. 자격증 실물 발급을 원하는 회원에 한하여 과정당 발급비 100,000원(집체교육 진행 시 200,000원)이 발생하며, 해당 금액에는 협회 자격증 발급비용과 택배비가 포함됩니다.</p>
          </section>
          <section className="policy-sec">
            <h2>제5조 (수료 및 합격 기준)</h2>
            <p>수료를 위해서는 온라인 강의 출석률 60% 이상을 충족하여야 하며, 자격 취득을 위해서는 온라인 시험에서 100점 만점 기준 60점 이상을 획득하여야 합니다. 합격 후 7일 이내에 자격증 발급을 신청하지 않을 경우 해당 과목이 초기화될 수 있습니다.</p>
          </section>
          <section className="policy-sec">
            <h2>제6조 (환불 및 청약철회)</h2>
            <p>수강료가 무료인 과정은 환불 대상 금액이 없습니다. 자격증 발급비를 결제한 경우, 발급 진행 전에는 전액 환불이 가능하며, 발급이 진행된 이후에는 제작·배송 비용을 제외한 금액이 환불될 수 있습니다. 자세한 사항은 고객센터로 문의하시기 바랍니다.</p>
          </section>
          <section className="policy-sec">
            <h2>제7조 (회원의 의무)</h2>
            <p>회원은 타인의 정보를 도용하거나 강의 콘텐츠를 무단으로 복제·배포하여서는 안 됩니다. 회원이 이를 위반하는 경우 회사는 서비스 이용을 제한할 수 있습니다.</p>
          </section>
          <section className="policy-sec">
            <h2>제8조 (자격의 성격)</h2>
            <p>회사가 발급하는 자격증은 한국직업능력연구원에 등록된 민간자격으로, 국가공인 자격증이 아닙니다. 회원은 자격 활용 시 이를 확인하여야 합니다.</p>
          </section>
          <section className="policy-sec">
            <h2>부칙</h2>
            <p>이 약관은 2026년 1월 1일부터 시행합니다.</p>
          </section>
        </div>
    </div>
  );
}
