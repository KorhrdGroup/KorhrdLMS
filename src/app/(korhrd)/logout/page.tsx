"use client";

import Link from 'next/link';
import { useEffect, useState } from "react";

import { logoutStudentAction } from "@/features/auth/actions/student-login.actions";

/**
 * 로그아웃 — 학생 세션 쿠키를 서버 액션으로 지웁니다.
 * (학생 인증은 Supabase가 아니라 httpOnly 쿠키라 클라이언트에서 지울 수 없습니다)
 * 액션이 홈으로 리다이렉트하므로 이 화면은 그 사이에만 잠깐 보입니다.
 */
export default function Page() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    logoutStudentAction().catch((error) => {
      // NEXT_REDIRECT는 정상 흐름(홈 이동)이므로 그대로 두고, 그 외만 실패로 봅니다.
      if (!(error instanceof Error && error.message.includes("NEXT_REDIRECT"))) {
        setFailed(true);
      }
    });
  }, []);

  return (
    <div className="container">
        <div className="auth-wrap">
          <div className="complete" style={{ paddingTop: '40px' }}>
            <p className="complete__sub" id="logout-msg">
              {failed ? "로그아웃에 실패했습니다. 다시 시도해주세요." : "로그아웃 중입니다…"}
            </p>
            <div style={{ display: 'grid', gap: '8px' }}>
              <Link className="btn btn--primary btn--lg btn--block" href="/">홈으로 이동</Link>
              <Link className="btn btn--ghost btn--block" href="/login">다시 로그인</Link>
            </div>
          </div>
        </div>
    </div>
  );
}
