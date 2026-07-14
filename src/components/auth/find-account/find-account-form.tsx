"use client";

import { useState } from "react";

import {
  findAccountByNameAndPhone,
  generateMockTempPassword,
  maskLoginId,
  verifyAccountForPassword,
} from "@/components/auth/find-account/find-account-data";
import type { FindAccountResult } from "@/components/auth/find-account/find-account-result-dialog";
import { FindAccountResultDialog } from "@/components/auth/find-account/find-account-result-dialog";
import { PhoneInput } from "@/components/auth/find-account/phone-input";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const fieldInputClassName =
  "h-12 rounded-md border-[#ddd] bg-[#f8f8f8] px-4 text-base placeholder:text-[#999]";

function FindIdForm({ onResult }: { onResult: (result: FindAccountResult) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) return;

    const account = findAccountByNameAndPhone(name, phone);
    if (account) {
      onResult({
        type: "id-success",
        maskedLoginId: maskLoginId(account.loginId),
        registeredAt: account.registeredAt,
      });
    } else {
      onResult({ type: "id-not-found" });
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <p className="pb-1 text-sm leading-relaxed text-[#888]">
        가입 시 등록한 이름과 휴대폰번호를 입력해주세요.
      </p>
      <Input
        type="text"
        autoComplete="name"
        placeholder="이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className={fieldInputClassName}
      />
      <PhoneInput value={phone} onChange={setPhone} />

      <button
        type="submit"
        className="mt-2 flex h-12 w-full items-center justify-center rounded-md bg-[#00376e] text-base font-semibold text-white transition hover:bg-[#2c74e4]"
      >
        아이디 찾기
      </button>
    </form>
  );
}

function FindPasswordForm({ onResult }: { onResult: (result: FindAccountResult) => void }) {
  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginId.trim() || !name.trim() || phone.replace(/\D/g, "").length < 10) return;

    const account = verifyAccountForPassword(loginId, name, phone);
    if (account) {
      onResult({
        type: "password-success",
        tempPassword: generateMockTempPassword(account.loginId),
      });
    } else {
      onResult({ type: "password-not-found" });
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <p className="pb-1 text-sm leading-relaxed text-[#888]">
        아이디, 이름, 휴대폰번호를 입력하면 임시 비밀번호를 발급해드립니다.
      </p>
      <Input
        type="text"
        autoComplete="username"
        placeholder="아이디"
        value={loginId}
        onChange={(event) => setLoginId(event.target.value)}
        className={fieldInputClassName}
      />
      <Input
        type="text"
        autoComplete="name"
        placeholder="이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className={fieldInputClassName}
      />
      <PhoneInput value={phone} onChange={setPhone} />

      <button
        type="submit"
        className="mt-2 flex h-12 w-full items-center justify-center rounded-md bg-[#00376e] text-base font-semibold text-white transition hover:bg-[#2c74e4]"
      >
        비밀번호 찾기
      </button>
    </form>
  );
}

export function FindAccountForm() {
  const [tab, setTab] = useState("id");
  const [result, setResult] = useState<FindAccountResult | null>(null);

  return (
    <div className="w-full max-w-[440px] rounded-[12px] border border-[#eee] bg-white px-7 py-9 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
      <h1 className="text-center text-[22px] leading-[1.4] font-bold text-[#222] sm:text-[26px]">
        아이디 · 비밀번호 찾기
      </h1>

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))} className="mt-7 gap-0">
        <TabsList className="h-12 w-full gap-1 rounded-[10px] border border-[#eee] bg-[#f8f8f8] p-1">
          <TabsTrigger
            value="id"
            className={cn(
              "h-full flex-1 rounded-[8px] text-[15px] font-semibold text-[#888] transition-colors",
              "data-active:bg-[#00376e] data-active:text-white data-active:shadow-none",
            )}
          >
            아이디 찾기
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className={cn(
              "h-full flex-1 rounded-[8px] text-[15px] font-semibold text-[#888] transition-colors",
              "data-active:bg-[#00376e] data-active:text-white data-active:shadow-none",
            )}
          >
            비밀번호 찾기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="id" className="mt-6">
          <FindIdForm onResult={setResult} />
        </TabsContent>
        <TabsContent value="password" className="mt-6">
          <FindPasswordForm onResult={setResult} />
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-xs leading-relaxed text-[#aaa]">
        데모 계정 예시 — 이름: 홍길동 / 휴대폰: 010-1234-5678 / 아이디: hanpyeong01
      </p>

      <FindAccountResultDialog
        result={result}
        onOpenChange={(open) => {
          if (!open) setResult(null);
        }}
        onRetry={() => setResult(null)}
      />
    </div>
  );
}
