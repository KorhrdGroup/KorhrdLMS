"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/admin/brand-logo";
import { AdminButton, AdminInput, AdminInputGroup } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormValid) return;
  }

  return (
    <div className="w-full max-w-[400px] rounded-2xl bg-white px-10 py-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <BrandLogo className="mb-8" />

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
          disabled={!isFormValid}
          size="lg"
          className={cn("mt-1 w-full", !isFormValid && "bg-[#CCCCCC] hover:bg-[#CCCCCC]")}
        >
          로그인
        </AdminButton>
      </form>
    </div>
  );
}
