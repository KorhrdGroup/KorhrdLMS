'use client';

import Script from 'next/script';
import { useRef, useState, useTransition } from 'react';

import { prepareVoucherPaymentAction } from '@/features/korhrd/actions/voucher-payment.actions';

declare global {
  interface Window {
    goPay?: (form: HTMLFormElement) => void;
    nicepaySubmit?: () => void;
    nicepayClose?: () => void;
  }
}

/**
 * 나이스페이 결제창 호출 폼.
 *
 * 결제하기 → 서버 액션이 서명 파라미터를 만들어 주면 숨은 폼을 채워 goPay 호출.
 * PC는 인증 후 nicepaySubmit 콜백에서 폼이 /api/nicepay/return 으로 제출되고,
 * 모바일은 나이스페이가 ReturnURL(같은 주소)로 직접 POST 합니다.
 */
export default function VoucherPayForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pay = () => {
    setError(null);
    const parsed = Number(amount.replace(/\D/g, ''));
    if (!parsed) {
      setError('결제 금액을 입력해주세요.');
      return;
    }

    startTransition(async () => {
      const prepared = await prepareVoucherPaymentAction({ amount: parsed });
      if (!prepared.success) {
        setError(prepared.message);
        return;
      }

      const form = formRef.current;
      if (!form || !window.goPay) {
        setError('결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.');
        return;
      }

      const set = (name: string, value: string) => {
        (form.elements.namedItem(name) as HTMLInputElement).value = value;
      };
      set('MID', prepared.mid);
      set('Moid', prepared.moid);
      set('EdiDate', prepared.ediDate);
      set('SignData', prepared.signData);
      set('GoodsName', prepared.goodsName);
      set('Amt', prepared.amt);
      set('BuyerName', prepared.buyerName);
      set('ReturnURL', `${window.location.origin}/api/nicepay/return`);

      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);
      if (isMobile) {
        /* 모바일 — 나이스페이 모바일 전용 페이지로 전체 화면 이동합니다.
           인증이 끝나면 나이스페이가 ReturnURL로 결과를 POST 합니다. */
        form.action = 'https://web.nicepay.co.kr/v3/v3Payment.jsp';
        form.submit();
        return;
      }

      // PC: 레이어 팝업. 인증이 끝나면 나이스페이가 이 콜백을 부릅니다 → 서버로 제출해 승인 진행
      form.action = '/api/nicepay/return';
      window.nicepaySubmit = () => form.submit();
      window.nicepayClose = () => setError('결제가 취소되었습니다.');
      window.goPay(form);
    });
  };

  return (
    <div className="card" style={{ maxWidth: 520, padding: 24 }}>
      <Script
        src="https://web.nicepay.co.kr/v3/webstd/js/nicepay-3.0.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <p style={{ fontSize: 14, color: '#4E5968', marginBottom: 16 }}>
        평생교육이용권으로 결제하실 금액을 입력한 뒤 결제하기를 눌러주세요.
        나이스페이 안전결제창이 열립니다.
      </p>

      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="voucher-amount">결제 금액 (원)</label>
        <input
          id="voucher-amount"
          type="text"
          inputMode="numeric"
          placeholder="예: 100000"
          value={amount}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '');
            setAmount(digits ? Number(digits).toLocaleString() : '');
          }}
        />
      </div>

      {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}

      <button
        className="btn btn--primary btn--lg btn--block"
        type="button"
        onClick={pay}
        disabled={isPending || !sdkReady}
      >
        {isPending ? '결제창 여는 중…' : '결제하기'}
      </button>

      {/* 나이스페이 결제창용 숨은 폼 — 값은 결제하기 시점에 서버 서명으로 채웁니다 */}
      <form
        ref={formRef}
        name="nicepayForm"
        method="post"
        action="/api/nicepay/return"
        acceptCharset="euc-kr"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="PayMethod" value="CARD" />
        <input type="hidden" name="GoodsName" defaultValue="" />
        <input type="hidden" name="Amt" defaultValue="" />
        <input type="hidden" name="MID" defaultValue="" />
        <input type="hidden" name="Moid" defaultValue="" />
        <input type="hidden" name="BuyerName" defaultValue="" />
        <input type="hidden" name="ReturnURL" defaultValue="" />
        <input type="hidden" name="EdiDate" defaultValue="" />
        <input type="hidden" name="SignData" defaultValue="" />
        <input type="hidden" name="CharSet" value="utf-8" />
        <input type="hidden" name="GoodsCl" value="1" />
      </form>
    </div>
  );
}
