"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type FindAccountResult =
  | { type: "id-success"; maskedLoginId: string; registeredAt: string }
  | { type: "id-not-found" }
  | { type: "password-success"; tempPassword: string }
  | { type: "password-not-found" };

type FindAccountResultDialogProps = {
  result: FindAccountResult | null;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
};

export function FindAccountResultDialog({
  result,
  onOpenChange,
  onRetry,
}: FindAccountResultDialogProps) {
  const isSuccess = result?.type === "id-success" || result?.type === "password-success";

  return (
    <Dialog open={result !== null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-[14px] border border-[#eee] bg-white p-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)] sm:max-w-[380px]"
      >
        <DialogHeader className="items-center gap-3 px-6 pt-8 pb-2 text-center">
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              isSuccess ? "bg-[#e5edff]" : "bg-[#fdecec]",
            )}
          >
            {isSuccess ? (
              <CheckCircle2 className="size-8 text-[#00376e]" strokeWidth={1.5} />
            ) : (
              <XCircle className="size-8 text-[#e74c3c]" strokeWidth={1.5} />
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-[#222]">
            {result?.type === "id-success" && "아이디를 찾았습니다"}
            {result?.type === "id-not-found" && "일치하는 회원 정보가 없습니다"}
            {result?.type === "password-success" && "임시 비밀번호가 발급되었습니다"}
            {result?.type === "password-not-found" && "일치하는 회원 정보가 없습니다"}
          </DialogTitle>
          <DialogDescription className="sr-only">아이디/비밀번호 찾기 결과</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2 text-center text-sm text-[#666]">
          {result?.type === "id-success" ? (
            <div className="space-y-3">
              <p>회원님의 아이디는 다음과 같습니다.</p>
              <p className="rounded-md bg-[#f8f8f8] py-3 text-lg font-bold tracking-wide text-[#00376e]">
                {result.maskedLoginId}
              </p>
              <p className="text-xs text-[#999]">가입일 {result.registeredAt}</p>
            </div>
          ) : null}

          {result?.type === "password-success" ? (
            <div className="space-y-3">
              <p>임시 비밀번호가 발급되었습니다.</p>
              <p className="rounded-md bg-[#f8f8f8] py-3 text-lg font-bold tracking-wide text-[#00376e]">
                {result.tempPassword}
              </p>
              <p className="text-xs leading-relaxed text-[#999]">
                (Mock) 실제 서비스에서는 휴대폰 문자로 발송되며, 화면에는 표시되지 않습니다.
                <br />
                로그인 후 반드시 비밀번호를 변경해주세요.
              </p>
            </div>
          ) : null}

          {(result?.type === "id-not-found" || result?.type === "password-not-found") && (
            <p className="leading-relaxed">
              입력하신 정보와 일치하는 회원을 찾을 수 없습니다.
              <br />
              정보를 다시 확인해주시거나 고객센터(02-2135-9249)로 문의해주세요.
            </p>
          )}
        </div>

        <DialogFooter className="-mx-0 -mb-0 mt-4 flex-row gap-2 rounded-none border-t border-[#eee] bg-white p-4 sm:justify-center">
          {isSuccess ? (
            <Link
              href="/login"
              className="flex h-11 flex-1 items-center justify-center rounded-md bg-[#00376e] text-sm font-semibold text-white transition hover:bg-[#2c74e4]"
            >
              로그인하러 가기
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="flex h-11 flex-1 items-center justify-center rounded-md bg-[#00376e] text-sm font-semibold text-white transition hover:bg-[#2c74e4]"
            >
              다시 입력하기
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
