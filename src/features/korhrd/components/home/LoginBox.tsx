'use client';

import Link from 'next/link';
import { useAuth } from '@/features/korhrd/lib/useAuth';

/**
 * 메인 히어로 오른쪽 박스. 로그인 여부에 따라 두 모습입니다 (Figma 334:8943).
 * 로그인 상태에서는 수강중인 강의를 최대 3개까지 D-day와 함께 보여줍니다.
 * 수강내역은 서버(홈 page.tsx)에서 DB로 읽어 prop으로 내려줍니다.
 */
export type LoginBoxCourse = { course: string; endDate: string; courseCode: string };
const dday = (endDate: string) => {
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000);
  return days >= 0 ? `D-${days}` : `D+${-days}`;
};

export default function LoginBox({ learning = [] }: { learning?: LoginBoxCourse[] }) {
  const { isLoggedIn, userName } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="loginbox loginbox--guest">
        <div>
          <p className="loginbox__brand">
            <img src="/logo.svg" alt="한평생 직업훈련" width={180} height={22} />
          </p>
          <h2><em>대한민국 NO.1 자격증 훈련기관</em>에<br />오신 것을 환영합니다!</h2>
        </div>
        <p className="loginbox__actions">
          <Link className="btn btn--primary" href="/login">로그인</Link>
          {/* 회원가입도 로그인 화면으로 (2026-08-12, 디자인 요청) */}
          <Link className="btn btn--soft-ink" href="/login">회원가입</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="loginbox loginbox--member">
      <h2 className="loginbox__hello"><em>{userName}</em>님 반갑습니다!</h2>
      <div className="loginbox__member-bottom">
        <p className="loginbox__actions">
          <Link className="btn btn--primary" href="/mylecture">나의 강의실</Link>
          <Link className="btn btn--soft-ink" href="/mylecture?tab=mypage">마이페이지</Link>
        </p>

        <div className="mylec-mini">
          {learning.length > 0 ? (
            <ul className="mylec-mini__list">
              {learning.map((e) => (
                <li key={e.course}>
                  {/* 과정코드를 못 찾은 경우엔 강의실 대신 나의 강의실로 보냅니다 */}
                  <Link href={e.courseCode ? `/lecture/${e.courseCode}` : '/mylecture'}>
                    <span className="mylec-mini__tit">{e.course}</span>
                    <span className="mylec-mini__dday">{dday(e.endDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mylec-mini__empty">수강중인 강의가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
