"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { loginStudentAction } from "@/features/auth/actions/student-login.actions";
import { SAVED_LOGIN_ID_KEY } from "@/lib/student/session";

/**
 * 로그인 폼 — 마크업은 korhrd 디자인(login.html), 동작은 기존 Supabase 액션.
 * 데모용 hidden login=1 파라미터는 실제 인증으로 대체하며 제거했습니다.
 */
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const saved = window.localStorage.getItem(SAVED_LOGIN_ID_KEY);
    if (saved) {
      setLoginId(saved);
      setSaveId(true);
    }
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      if (saveId) {
        window.localStorage.setItem(SAVED_LOGIN_ID_KEY, loginId.trim());
      } else {
        window.localStorage.removeItem(SAVED_LOGIN_ID_KEY);
      }
      const result = await loginStudentAction({ loginId, password, redirectTo });
      if (result?.success === false) {
        setToastMessage(result.message);
      }
    });
  }

  return (
    <>
      {toastMessage ? (
        <div
          role="status"
          style={{
            position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
            zIndex: 100, background: "#333", color: "#fff", borderRadius: 8,
            padding: "12px 20px", fontSize: 14,
          }}
        >
          {toastMessage}
        </div>
      ) : null}

      {redirectTo ? (
        <p className="login-notice">
          로그인이 필요한 페이지입니다.<br />
          로그인하시면 원래 보시려던 화면으로 이동합니다.
        </p>
      ) : null}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form" style={{ maxWidth: "none" }}>
          <div className="field">
            <label htmlFor="userid">
              아이디 <span className="req" aria-hidden="true">*</span>
              <span className="sr-only">(필수)</span>
            </label>
            <input
              id="userid" name="loginId" type="text" required autoComplete="username"
              placeholder="아이디를 입력하세요" value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="userpw">
              비밀번호 <span className="req" aria-hidden="true">*</span>
              <span className="sr-only">(필수)</span>
            </label>
            <input
              id="userpw" name="password" type="password" required autoComplete="current-password"
              placeholder="비밀번호를 입력하세요" value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <p className="agree">
            <input
              id="keep" name="keep" type="checkbox" checked={saveId}
              onChange={(event) => setSaveId(event.target.checked)}
            />
            <label htmlFor="keep">아이디 저장</label>
          </p>

          <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={isPending}>
            {isPending ? "로그인 중…" : "로그인"}
          </button>
        </div>

        <p className="login-links">
          <Link href="/signup">회원가입</Link>
          <span aria-hidden="true">|</span>
          <Link href="/find-account">아이디 찾기</Link>
          <span aria-hidden="true">|</span>
          <Link href="/find-account">비밀번호 찾기</Link>
        </p>
      </form>

      <div className="card mt-4" style={{ padding: "18px 20px" }}>
        <p style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.75 }}>
          아직 회원이 아니신가요?<br />
          회원가입 후 <b style={{ color: "var(--ink)" }}>80여 개 과정을 수강료 0원</b>으로 신청하실 수 있습니다.
        </p>
        <Link className="btn btn--ghost btn--block mt-3" href="/signup">
          회원가입하고 무료수강 시작하기
        </Link>
      </div>
    </>
  );
}
