/**
 * 비밀번호 변경
 *
 * 프로토타입 원본: korhrd-site/password-change.html
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
            <li aria-current="page">비밀번호 변경</li>
          </ol>
        </nav>

        <div className="auth-wrap">
          <div className="page-head">
            <h1>비밀번호 변경</h1>
          </div>

          <div className="form-card mt-5">
            <form className="form" style={{ maxWidth: 'none' }} action="/mylecture" method="get">
              <input type="hidden" name="tab" defaultValue="mypage" />
              <div className="field">
                <label htmlFor="pw-now">현재 비밀번호 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
                <input id="pw-now" name="pwnow" type="password" required={true} autoComplete="current-password" placeholder="현재 비밀번호를 입력하세요" />
              </div>
              <div className="field">
                <label htmlFor="pw-new">새 비밀번호 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
                <input id="pw-new" name="pwnew" type="password" required={true} autoComplete="new-password" placeholder="영문·숫자·특수문자 8자 이상" />
              </div>
              <div className="field">
                <label htmlFor="pw-new2">새 비밀번호 확인 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
                <input id="pw-new2" name="pwnew2" type="password" required={true} autoComplete="new-password" placeholder="새 비밀번호를 다시 입력하세요" />
              </div>

              <button className="btn btn--primary btn--lg btn--block mt-2" type="submit">비밀번호 변경</button>
              <a className="btn btn--ghost btn--block" href="/mylecture?tab=mypage">취소</a>
            </form>
          </div>

          <div className="guide-box">
            <strong>비밀번호 안내</strong>
            <ul style={{ gridTemplateColumns: '1fr' }}>
              <li>영문·숫자·특수문자를 조합해 8자 이상으로 설정해 주세요</li>
              <li>이전에 사용한 비밀번호는 다시 사용할 수 없습니다</li>
              <li>비밀번호가 기억나지 않으면 <a href="/find" style={{ textDecoration: 'underline' }}>비밀번호 찾기</a>를 이용해 주세요</li>
            </ul>
          </div>
        </div>

    </div>
  );
}
