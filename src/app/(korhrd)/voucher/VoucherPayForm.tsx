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

export type VoucherPayFormProps = {
  /** 로그인한 회원 — null 이면 비회원 결제(이름·휴대폰 입력을 받습니다) */
  member: { name: string } | null;
};

/**
 * 나이스페이 결제창 호출 폼.
 *
 * 결제하기 → 서버 액션이 서명 파라미터를 만들어 주면 숨은 폼을 채워 goPay 호출.
 * PC는 인증 후 nicepaySubmit 콜백에서 폼이 /api/nicepay/return 으로 제출되고,
 * 모바일은 나이스페이가 ReturnURL(같은 주소)로 직접 POST 합니다.
 *
 * 로그인 없이도 결제할 수 있습니다 — 비회원은 이름·휴대폰을 받아 결제자를 남깁니다.
 * `member` 는 처음 입력칸을 보일지 정하는 힌트일 뿐, 로그인 여부의 최종 판단은
 * 서버 액션이 합니다. 액션이 `buyer_required` 를 돌려주면(레이아웃 캐시·세션 만료로
 * 화면과 어긋난 경우) 그 자리에서 입력칸을 펼쳐 이어서 결제할 수 있게 합니다.
 */
export default function VoucherPayForm({ member }: VoucherPayFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState('');
  const [guestMode, setGuestMode] = useState(() => member === null);
  const [guestName, setGuestName] = useState('');
  const [guestTel, setGuestTel] = useState('');
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
    if (guestMode) {
      if (!guestName.trim()) {
        setError('결제자 이름을 입력해주세요.');
        return;
      }
      const telDigits = guestTel.replace(/\D/g, '');
      if (telDigits.length < 10 || telDigits.length > 11) {
        setError('휴대폰 번호를 정확히 입력해주세요. (예: 010-1234-5678)');
        return;
      }
    }

    startTransition(async () => {
      const prepared = await prepareVoucherPaymentAction({
        amount: parsed,
        buyerName: guestMode ? guestName : undefined,
        buyerTel: guestMode ? guestTel : undefined,
      });
      if (!prepared.success) {
        // 서버가 보기엔 로그인이 아니었던 경우 — 숨겼던 이름·휴대폰 칸을 펼쳐 이어서 진행
        if (prepared.code === 'buyer_required') setGuestMode(true);
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
      /* 주문번호를 돌아올 주소의 쿼리에도 싣습니다. 콜백 본문의 Moid 는 나이스페이가 직접
         POST 하는 흐름(앱카드·리다이렉트·모바일)에서 비거나 달라질 수 있어 — 실제로 비어 온
         적이 있음 — 우리가 정한 URL 로 주문을 찾는 게 세션·본문에 기대지 않는 확실한 길입니다. */
      const returnUrl = `${window.location.origin}/api/nicepay/return?moid=${encodeURIComponent(prepared.moid)}`;
      set('ReturnURL', returnUrl);

      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);
      if (isMobile) {
        /* 모바일 — 나이스페이 모바일 전용 페이지로 전체 화면 이동합니다.
           인증이 끝나면 나이스페이가 ReturnURL로 결과를 POST 합니다. */
        form.action = 'https://web.nicepay.co.kr/v3/v3Payment.jsp';
        form.submit();
        return;
      }

      // PC: 레이어 팝업. 인증이 끝나면 나이스페이가 이 콜백을 부릅니다 → 서버로 제출해 승인 진행
      form.action = returnUrl;
      window.nicepaySubmit = () => form.submit();
      window.nicepayClose = () => setError('결제가 취소되었습니다.');
      window.goPay(form);
    });
  };

  return (
    <div className="card" style={{ maxWidth: 520, padding: 24 }}>
      {/* onLoad 가 아니라 onReady — next/script 는 같은 스크립트를 한 번만 내려받아, 모달을
          다시 열거나 로그인 뒤 폼이 다시 마운트되면 onLoad 는 두 번 다시 불리지 않는다.
          그러면 SDK(goPay)는 이미 있는데 sdkReady 만 false 로 남아 결제하기가 영영 잠긴다.
          onReady 는 처음 로드 때와 이후 매 마운트마다 불린다. */}
      <Script
        src="https://web.nicepay.co.kr/v3/webstd/js/nicepay-3.0.js"
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
      />

      <p style={{ fontSize: 14, color: '#4E5968', marginBottom: 16 }}>
        평생교육이용권으로 결제하실 금액을 입력한 뒤 결제하기를 눌러주세요.
        나이스페이 안전결제창이 열립니다.
        {guestMode ? ' 회원이 아니어도 결제할 수 있습니다.' : null}
      </p>

      {guestMode ? (
        <>
          <div className="field" style={{ marginBottom: 12 }}>
            <label htmlFor="voucher-guest-name">결제자 이름</label>
            <input
              id="voucher-guest-name"
              type="text"
              autoComplete="name"
              placeholder="예: 홍길동"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label htmlFor="voucher-guest-tel">휴대폰 번호</label>
            <input
              id="voucher-guest-tel"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="예: 010-1234-5678"
              value={guestTel}
              onChange={(event) => setGuestTel(event.target.value)}
            />
          </div>
        </>
      ) : null}

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
