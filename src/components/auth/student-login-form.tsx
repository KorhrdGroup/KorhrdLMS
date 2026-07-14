"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { loginStudentAction } from "@/features/auth/actions/student-login.actions";
import { Input } from "@/components/ui/input";
import { SAVED_LOGIN_ID_KEY } from "@/lib/student/session";
import { cn } from "@/lib/utils";

export function StudentLoginForm({ redirectTo }: { redirectTo?: string }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const savedLoginId = window.localStorage.getItem(SAVED_LOGIN_ID_KEY);
    if (savedLoginId) {
      setLoginId(savedLoginId);
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

      const result = await loginStudentAction({
        loginId,
        password,
        redirectTo,
      });

      if (result?.success === false) {
        setToastMessage(result.message);
      }
    });
  }

  return (
    <>
      {toastMessage ? (
        <div className="fixed top-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg bg-[#333] px-4 py-3 text-center text-sm text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}

      <div className="w-full max-w-[580px] rounded-[12px] border border-[#eee] bg-white px-9 py-9 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:px-14 sm:py-10">
        <h1 className="text-center text-[22px] leading-[1.45] font-bold text-[#222] sm:text-[26px]">
          최고의 전문가가
          <br />
          책임있게 안내합니다.
        </h1>

        {redirectTo ? (
          <p className="mt-4 rounded-md bg-[#f4f8ff] px-3 py-2.5 text-center text-[13px] text-[#00376e]">
            로그인이 필요한 페이지입니다. 로그인 후 이어서 이용해주세요.
          </p>
        ) : null}

        <form className="mt-8 space-y-3" onSubmit={handleSubmit}>
          <Input
            type="text"
            name="loginId"
            autoComplete="username"
            placeholder="아이디"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            className="h-12 rounded-md border-[#ddd] bg-[#f8f8f8] px-4 text-base placeholder:text-[#999]"
          />

          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-md border-[#ddd] bg-[#f8f8f8] px-4 text-base placeholder:text-[#999]"
          />

          <div className="flex items-center justify-between pt-1 text-sm text-[#888]">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={saveId}
                onChange={(event) => setSaveId(event.target.checked)}
                className="size-4 rounded border-[#ccc] accent-[#00376e]"
              />
              ID저장
            </label>
            <Link href="/find-account" className="hover:text-[#00376e]">
              ID/PW 찾기
            </Link>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "mt-2 flex h-12 w-full items-center justify-center rounded-md bg-[#00376e] text-base font-semibold text-white transition hover:bg-[#2c74e4]",
              isPending && "opacity-70",
            )}
          >
            로그인
          </button>

          <Link
            href="/signup"
            className="flex h-12 w-full items-center justify-center rounded-md border border-[#00376e] bg-white text-base font-semibold text-[#00376e] transition hover:bg-[#f4f8fc]"
          >
            회원가입
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-1.5 rounded-md bg-[#03C75A] px-2 text-[11px] font-semibold whitespace-nowrap text-white sm:h-12 sm:gap-2 sm:px-3 sm:text-[13px]"
            >
              <Image
                src="/images/login/icon_naver.png"
                alt=""
                width={16}
                height={16}
                className="shrink-0"
              />
              네이버 회원가입 / 로그인
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-1.5 rounded-md bg-[#FEE500] px-2 text-[11px] font-semibold whitespace-nowrap text-[#191919] sm:h-12 sm:gap-2 sm:px-3 sm:text-[13px]"
            >
              <Image
                src="/images/login/icon_kakao.png"
                alt=""
                width={16}
                height={16}
                className="shrink-0"
              />
              카카오 회원가입 / 로그인
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
