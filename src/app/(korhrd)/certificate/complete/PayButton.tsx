'use client';

import { useState, useTransition } from 'react';

import { startCertificatePaymentAction } from '@/features/payments/payapp/payapp.actions';

/**
 * 발급비 결제하기 — PayApp 결제창으로 보냅니다.
 *
 * 결제 결과는 화면이 아니라 서버 통보(/api/payapp/feedback)로 확정됩니다.
 * 그래서 여기서는 "결제했다"고 단정하지 않고 결제창으로 보내기만 합니다.
 */
export default function PayButton({ applicationId }: { applicationId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pay = () => {
    setError(null);
    startTransition(async () => {
      const result = await startCertificatePaymentAction(applicationId);
      if (result.success) {
        window.location.href = result.payUrl;
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <>
      {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}
      <button
        className="btn btn--primary btn--lg btn--block"
        type="button"
        onClick={pay}
        disabled={isPending}
      >
        {isPending ? '결제창 여는 중…' : '발급비 결제하기'}
      </button>
    </>
  );
}
