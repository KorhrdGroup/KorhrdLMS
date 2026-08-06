"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from "react";

import { logoutStudentAction } from "@/features/auth/actions/student-login.actions";

/**
 * 로그아웃 — 학생 세션 쿠키를 서버 액션으로 지웁니다.
 * (학생 인증은 Supabase가 아니라 httpOnly 쿠키라 클라이언트에서 지울 수 없습니다)
 *
 * ⚠ 서버 액션을 useEffect에서 그냥 호출하면 **로그아웃한 것처럼 보이지 않습니다.**
 * 액션 안의 redirect()가 라우터를 거치지 않아 화면이 "로그아웃 중…"에 머물고
 * 헤더도 로그인 상태 그대로 남습니다. startTransition 안에서 불러야 Next가
 * 응답의 리다이렉트를 처리합니다.
 */
export default function Page() {
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();
  const started = useRef(false);

  useEffect(() => {
    // 개발 모드에서 effect가 두 번 실행되는 것을 막습니다.
    if (started.current) return;
    started.current = true;

    startTransition(async () => {
      try {
        await logoutStudentAction();
      } catch (error) {
        // NEXT_REDIRECT는 정상 흐름(홈 이동)이므로 그대로 두고, 그 외만 실패로 봅니다.
        if (!(error instanceof Error && error.message.includes("NEXT_REDIRECT"))) {
          setFailed(true);
        }
      }
    });
  }, [startTransition]);

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
