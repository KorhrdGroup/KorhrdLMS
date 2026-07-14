"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeContainer } from "@/components/home/home-container";
import { figma, figmaClass } from "@/components/home/home-design";
import { QuickMenu } from "@/components/home/QuickMenu";
import {
  cancelPaymentAction,
  confirmPaymentTestAction,
} from "@/features/payments/actions/student-payment.actions";
import type { CoursePaymentSummary } from "@/features/payments/types/payment.types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<CoursePaymentSummary["status"], string> = {
  ready: "결제 준비",
  pending: "결제 진행중",
  paid: "결제 완료",
  failed: "결제 실패",
  canceled: "결제 취소",
  refunded: "환불 완료",
};

const STATUS_TONE: Record<CoursePaymentSummary["status"], string> = {
  ready: "bg-[#E0E7FF] text-[#3730A3]",
  pending: "bg-[#FEF3C7] text-[#92400E]",
  paid: "bg-[#DCFCE7] text-[#166534]",
  failed: "bg-[#FEE2E2] text-[#991B1B]",
  canceled: "bg-[#F3F4F6] text-[#6B7280]",
  refunded: "bg-[#FCE7F3] text-[#9D174D]",
};

function formatAmount(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("min-h-screen", figmaClass.pageBg)}>
      <HomeHeader />
      <main className="py-16">
        <HomeContainer className="max-w-2xl">{children}</HomeContainer>
      </main>
      <HomeFooter />
      <QuickMenu />
    </div>
  );
}

export function CheckoutBoard({ payment }: { payment: CoursePaymentSummary | null }) {
  const router = useRouter();
  const [current, setCurrent] = useState(payment);
  const [isConfirming, startConfirmTransition] = useTransition();
  const [isCanceling, startCancelTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!current) {
    return (
      <Shell>
        <div
          className={cn(
            "flex flex-col items-center gap-4 border bg-white p-10 text-center",
            figmaClass.roundedCard,
            figmaClass.borderDefault,
          )}
        >
          <h1 className={cn("text-xl font-extrabold", figmaClass.textPrimary)}>
            결제 정보를 찾을 수 없습니다
          </h1>
          <p className={cn("text-sm", figmaClass.textPlaceholder)}>
            존재하지 않거나 본인의 결제 건이 아닙니다. 수강신청 화면에서 다시 시도해주세요.
          </p>
          <Link
            href="/enrollment"
            className="mt-2 rounded-lg px-6 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: figma.colors.primary }}
          >
            수강신청 화면으로 이동
          </Link>
        </div>
      </Shell>
    );
  }

  function handleConfirm() {
    if (isConfirming) return;
    setErrorMessage(null);

    startConfirmTransition(async () => {
      const result = await confirmPaymentTestAction({ paymentId: current!.id });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setCurrent(result.payment);
      router.refresh();
    });
  }

  function handleCancel() {
    if (isCanceling) return;
    setErrorMessage(null);

    startCancelTransition(async () => {
      const result = await cancelPaymentAction({ paymentId: current!.id });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setCurrent(result.payment);
      router.refresh();
    });
  }

  const isActionable = current.status === "ready" || current.status === "pending";

  return (
    <Shell>
      <div
        className={cn(
          "flex flex-col gap-6 border bg-white p-8",
          figmaClass.roundedCard,
          figmaClass.borderDefault,
        )}
      >
        <div className="flex items-center justify-between">
          <h1 className={cn("text-xl font-extrabold", figmaClass.textPrimary)}>결제하기</h1>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              STATUS_TONE[current.status],
            )}
          >
            {STATUS_LABELS[current.status]}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-3 border-y py-5 text-sm sm:grid-cols-2" style={{ borderColor: "#eee" }}>
          <div>
            <dt className={figmaClass.textPlaceholder}>과정명</dt>
            <dd className={cn("mt-1 font-semibold", figmaClass.textBody)}>{current.courseName}</dd>
          </div>
          <div>
            <dt className={figmaClass.textPlaceholder}>주문번호</dt>
            <dd className={cn("mt-1 font-mono text-[13px]", figmaClass.textBody)}>
              {current.pgOrderId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className={figmaClass.textPlaceholder}>결제금액</dt>
            <dd className="mt-1 text-lg font-extrabold" style={{ color: figma.colors.primary }}>
              {formatAmount(current.amount)}
            </dd>
          </div>
          <div>
            <dt className={figmaClass.textPlaceholder}>PG사</dt>
            <dd className={cn("mt-1", figmaClass.textBody)}>
              {current.pgProvider ?? "연동 예정"}
            </dd>
          </div>
        </dl>

        {errorMessage ? <p className="text-sm text-[#e5433f]">{errorMessage}</p> : null}

        {isActionable ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-[#f4f8ff] p-4 text-[13px] leading-relaxed text-[#00376e]">
              실제 PG(결제대행사) 결제창 연동 준비 중입니다. 현재는 개발/테스트 목적으로
              아래 버튼을 눌러 결제 완료 처리를 진행할 수 있습니다. (실제 결제는 발생하지 않습니다)
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming || isCanceling}
              className="h-12 rounded-lg text-[15px] font-bold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: figma.colors.primary }}
            >
              {isConfirming ? "처리 중..." : "결제 성공 처리 (테스트)"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isConfirming || isCanceling}
              className={cn(
                "h-12 rounded-lg border text-[15px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] disabled:opacity-50",
                figmaClass.textSub,
                figmaClass.borderDefault,
              )}
            >
              {isCanceling ? "처리 중..." : "결제 취소"}
            </button>
          </div>
        ) : null}

        {current.status === "paid" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#0f9d58]">
              결제가 완료되어 수강신청이 확정되었습니다.
            </p>
            <Link
              href="/classroom"
              className="flex h-12 items-center justify-center rounded-lg text-[15px] font-bold text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: figma.colors.primary }}
            >
              학습강의실로 이동
            </Link>
          </div>
        ) : null}

        {current.status === "failed" || current.status === "canceled" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[#6B7280]">
              {current.status === "failed"
                ? "결제에 실패했습니다. 다시 시도해주세요."
                : "결제가 취소되었습니다."}
            </p>
            <Link
              href="/enrollment"
              className="flex h-12 items-center justify-center rounded-lg text-[15px] font-bold text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: figma.colors.primary }}
            >
              수강신청 화면으로 이동
            </Link>
          </div>
        ) : null}

        {current.status === "refunded" ? (
          <p className="text-sm text-[#6B7280]">환불이 완료된 결제 건입니다.</p>
        ) : null}
      </div>
    </Shell>
  );
}
