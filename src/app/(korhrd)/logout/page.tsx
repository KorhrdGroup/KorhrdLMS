import type { Metadata } from 'next';
import Link from 'next/link';

import { logoutStudentAction } from '@/features/auth/actions/student-login.actions';

export const metadata: Metadata = {
  title: '로그아웃 — 한평생 직업훈련',
  robots: { index: false },
};

/**
 * 로그아웃.
 *
 * ⚠ 서버 액션을 코드에서(useEffect 등) 호출하면 액션 안의 redirect가 라우터를
 * 타지 못해 **세션이 그대로 남습니다.** 실제로 그 방식으로 두 번 실패했습니다.
 * 폼 제출(action={logoutStudentAction})은 Next가 액션 응답의 리다이렉트를
 * 확실히 처리합니다 — 헤더의 로그아웃도 같은 방식입니다.
 *
 * 그래서 이 화면은 "로그아웃 중"이 아니라 **확인 화면**입니다.
 * 자동으로 처리하지 않고 사용자가 버튼을 눌러 로그아웃합니다.
 */
export default function Page() {
  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="complete" style={{ paddingTop: '40px' }}>
          <p className="complete__sub">로그아웃하시겠습니까?</p>

          <div style={{ display: 'grid', gap: '8px' }}>
            <form action={logoutStudentAction}>
              <button className="btn btn--primary btn--lg btn--block" type="submit">
                로그아웃
              </button>
            </form>
            <Link className="btn btn--ghost btn--block" href="/">홈으로 이동</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
