/**
 * 개인정보처리방침
 *
 * 프로토타입 원본: korhrd-site/privacy.html
 * ⚠ 이 파일은 마크업만 옮긴 상태입니다. 아래를 확인해 주세요.
 *   - 반복되는 목록은 data/*.ts 를 map() 으로 돌리도록 바꾸기
 *   - 상호작용(탭·아코디언·필터 등)은 components/ 의 공용 컴포넌트로 교체
 *   - class 이름은 그대로 두세요. styles/*.css 가 그 이름에 걸려 있습니다.
 */
export default function Page() {
  return (
    <div className="container">
        <nav className="breadcrumb" aria-label="현재 위치"><ol><li><a href="/">홈</a></li><li aria-current="page">개인정보처리방침</li></ol></nav>
        <div className="page-head"><h1>개인정보처리방침</h1></div>
        <div className="policy card">
          <section className="policy-sec">
            <h2>1. 수집하는 개인정보 항목</h2>
            <table className="info-table"><tbody><tr><th scope="row">필수</th><td>이름, 아이디, 비밀번호, 휴대폰 번호, 생년월일</td></tr><tr><th scope="row">선택</th><td>이메일, 증명사진(자격증 발급 시)</td></tr><tr><th scope="row">자동수집</th><td>접속 IP, 쿠키, 서비스 이용 기록</td></tr></tbody></table>
          </section>
          <section className="policy-sec">
            <h2>2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="policy-list"><li>회원 가입 및 관리, 본인 확인</li><li>수강 신청·진도 관리·시험 응시 등 서비스 제공</li><li>자격증 발급 및 배송</li><li>고객 문의 응대 및 공지 전달</li></ul>
          </section>
          <section className="policy-sec">
            <h2>3. 개인정보의 보유 및 이용 기간</h2>
            <p>회원 탈퇴 시 지체 없이 파기합니다. 다만 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다. (계약·청약철회 기록 5년, 대금결제 기록 5년, 소비자 불만·분쟁처리 기록 3년)</p>
          </section>
          <section className="policy-sec">
            <h2>4. 개인정보의 제3자 제공</h2>
            <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 자격증 발급을 위하여 자격관리기관(한국직업능력협회)에 발급에 필요한 최소한의 정보(이름, 생년월일, 증명사진)를 제공합니다.</p>
          </section>
          <section className="policy-sec">
            <h2>5. 정보주체의 권리와 행사 방법</h2>
            <p>이용자는 언제든지 자신의 개인정보를 조회·수정하거나 처리 정지·삭제를 요구할 수 있습니다. 권리 행사는 고객센터를 통해 하실 수 있으며, 회사는 지체 없이 조치합니다.</p>
          </section>
          <section className="policy-sec">
            <h2>6. 개인정보 보호책임자</h2>
            <table className="info-table"><tbody><tr><th scope="row">책임자</th><td>양병웅</td></tr><tr><th scope="row">연락처</th><td>02-2135-9249 / korhrdpartners@gmail.com</td></tr></tbody></table>
          </section>
          <section className="policy-sec">
            <h2>부칙</h2>
            <p>이 방침은 2026년 1월 1일부터 시행합니다.</p>
          </section>
        </div>
    </div>
  );
}
