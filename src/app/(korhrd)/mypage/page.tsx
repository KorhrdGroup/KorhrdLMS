/**
 * 회원정보 수정
 *
 * 프로토타입 원본: korhrd-site/mypage-edit.html
 * ⚠ 이 파일은 마크업만 옮긴 상태입니다. 아래를 확인해 주세요.
 *   - 반복되는 목록은 data/*.ts 를 map() 으로 돌리도록 바꾸기
 *   - 상호작용(탭·아코디언·필터 등)은 components/ 의 공용 컴포넌트로 교체
 *   - class 이름은 그대로 두세요. styles/*.css 가 그 이름에 걸려 있습니다.
 */
export default function Page() {
  return (
    <div className="container">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><a href="/">홈</a></li>
            <li><a href="/mylecture?tab=mypage">나의 강의실</a></li>
            <li aria-current="page">회원정보 수정</li>
          </ol>
        </nav>

        <div className="page-head">
          <h1>회원정보 수정</h1>
        </div>

        <div className="form-card mt-5">
          <form className="form" style={{ maxWidth: 'none' }} action="/mylecture" method="get">
              <input type="hidden" name="tab" defaultValue="mypage" />

            <div className="field">
              <label htmlFor="mp-id">아이디</label>
              <input id="mp-id" name="userid" type="text" defaultValue="hanpyungsaeng" readOnly={true} autoComplete="username" />
              <p style={{ fontSize: '11.5px', color: 'var(--faint)', marginTop: '7px' }}>아이디는 변경할 수 없습니다.</p>
            </div>

            <div className="field">
              <label htmlFor="mp-name">이름 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span> <span className="hint">— 자격증에 표기됩니다</span></label>
              <input id="mp-name" name="name" type="text" required={true} autoComplete="name" defaultValue="한평생" />
            </div>

            <div className="field">
              <label htmlFor="mp-phone">휴대폰 번호 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
              <input id="mp-phone" name="phone" type="tel" required={true} autoComplete="tel" inputMode="numeric" defaultValue="010-1234-5678" />
            </div>

            <div className="field">
              <label htmlFor="mp-email">이메일</label>
              <input id="mp-email" name="email" type="email" autoComplete="email" defaultValue="hanpyungsaeng@example.com" />
            </div>

            <div className="field">
              <label htmlFor="mp-zip">우편번호 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input id="mp-zip" name="zip" type="text" required={true} inputMode="numeric" defaultValue="01411" style={{ maxWidth: '140px' }} />
                <button className="btn btn--ghost" type="button">우편번호 검색</button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="mp-addr">주소 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
              <input id="mp-addr" name="addr" type="text" required={true} defaultValue="서울시 도봉구 마들로13길 61" />
            </div>

            <div className="field">
              <label htmlFor="mp-addr2">상세주소</label>
              <input id="mp-addr2" name="addr2" type="text" defaultValue="씨드큐브 905호" />
            </div>

            <div className="result-cta mt-4">
              <a className="btn btn--ghost btn--lg" href="/mylecture?tab=mypage">취소</a>
              <button className="btn btn--primary btn--lg" type="submit">변경 내용 저장</button>
            </div>
          </form>
        </div>

        <div className="guide-box">
          <strong>회원정보 안내</strong>
          <ul>
            <li>자격증은 등록된 주소로 배송되니 변경 시 미리 수정해 주세요</li>
            <li>이름은 자격증에 표기되므로 실명으로 입력해 주세요</li>
            <li>휴대폰 번호는 시험 일정·합격 안내 문자 수신에 사용됩니다</li>
            <li>비밀번호 변경은 <a href="/mypage/password" style={{ textDecoration: 'underline' }}>비밀번호 변경</a>에서 하실 수 있습니다</li>
          </ul>
        </div>

    </div>
  );
}
