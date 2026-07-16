"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";

import { BrandLogo } from "@/components/admin/brand-logo";
import { AdminButton, AdminInput, AdminInputGroup } from "@/components/admin/ui";
import { loginAdminAction } from "@/features/admin-auth/actions/admin-auth.actions";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormValid || isPending) return;

    setError(null);
    startTransition(async () => {
      // 성공 시 서버 액션이 /admin으로 redirect하므로 반환값은 실패일 때만 존재합니다.
      const result = await loginAdminAction({ email, password });
      if (result && !result.success) {
        setError(result.message);
      }
    });
  }

  return (
    <div className="w-full max-w-[400px] rounded-2xl bg-white px-10 py-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <BrandLogo className="mb-8" />

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{error}</p>
        ) : null}
        <AdminInput
          type="email"
          name="email"
          autoComplete="email"
          placeholder="이메일"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12"
        />

        <AdminInputGroup>
          <AdminInput
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 pr-12"
          />
          <button
            type="button"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </AdminInputGroup>

        <AdminButton
          type="submit"
          disabled={!isFormValid || isPending}
          size="lg"
          className={cn("mt-1 w-full", (!isFormValid || isPending) && "bg-[#CCCCCC] hover:bg-[#CCCCCC]")}
        >
          {isPending ? "로그인 중..." : "로그인"}
        </AdminButton>
      </form>
    </div>
  );
}
