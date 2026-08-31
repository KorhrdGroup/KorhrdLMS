import type { Metadata } from 'next';
import Link from 'next/link';

import { todayInKst } from '@/lib/shared/kst-date';

export const metadata: Metadata = {
  title: '평생교육이용권 결제 결과 — 한평생 직업훈련',
  robots: { index: false },
};

/** 나이스페이 결제 결과 — 영수증 카드 한 장을 화면 중앙에 보여줍니다. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pick = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '');
  const ok = pick('result') === 'ok';
  const amt = Number(pick('amt')) || 0;
  const moid = pick('moid');
  const message = pick('message');

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    fontSize: 14,
    padding: '10px 0',
  };
  const labelStyle: React.CSSProperties = { color: '#8B95A1', flexShrink: 0 };
  const valueStyle: React.CSSProperties = {
    color: '#333D4B',
    fontWeight: 500,
    textAlign: 'right' as const,
    wordBreak: 'break-all' as const,
  };

  return (
    <div
      style={{
        // 헤더를 뺀 화면 전체 기준 정중앙
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 6px 24px rgba(15, 23, 42, 0.08)',
          padding: '40px 28px 28px',
          textAlign: 'center',
        }}
      >
        {ok ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/voucher-complete-check.png"
            alt=""
            aria-hidden="true"
            style={{ display: 'block', width: 84, height: 84, objectFit: 'contain', margin: '0 auto 16px' }}
          />
        ) : (
          <p style={{ fontSize: 48, marginBottom: 12 }}>❌</p>
        )}

        <h1 style={{ fontSize: 21, fontWeight: 700, marginBottom: 6, color: '#191F28' }}>
          {ok ? '결제가 완료되었습니다' : '결제가 완료되지 않았습니다'}
        </h1>
        <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24 }}>
          {ok
            ? '평생교육이용권 결제가 정상 처리되었습니다.'
            : message || '결제가 취소되었거나 실패했습니다. 다시 시도해주세요.'}
        </p>

        {ok ? (
          <div
            style={{
              background: '#F9FAFB',
              borderRadius: 12,
              padding: '6px 18px',
              marginBottom: 24,
              textAlign: 'left',
            }}
          >
            <div style={{ ...rowStyle, borderBottom: '1px solid #F2F4F6' }}>
              <span style={labelStyle}>상품명</span>
              <span style={valueStyle}>평생교육이용권</span>
            </div>
            <div style={{ ...rowStyle, borderBottom: '1px solid #F2F4F6' }}>
              <span style={labelStyle}>결제일</span>
              <span style={valueStyle}>{todayInKst().replace(/-/g, '. ')}.</span>
            </div>
            {moid ? (
              <div style={{ ...rowStyle, borderBottom: '1px solid #F2F4F6' }}>
                <span style={labelStyle}>주문번호</span>
                <span style={{ ...valueStyle, fontSize: 12.5, color: '#8B95A1' }}>{moid}</span>
              </div>
            ) : null}
            <div style={rowStyle}>
              <span style={labelStyle}>결제금액</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#3182F6' }}>
                {amt.toLocaleString()}원
              </span>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 8 }}>
          {ok ? (
            <Link className="btn btn--primary btn--block" href="/">홈으로</Link>
          ) : (
            <Link className="btn btn--primary btn--block" href="/support">다시 결제하기</Link>
          )}
          <Link className="btn btn--ghost btn--block" href="/support">고객센터</Link>
        </div>

        {ok ? (
          <p style={{ fontSize: 12.5, color: '#B0B8C1', marginTop: 16 }}>
            결제 확인 후 담당자가 순차적으로 처리해드립니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
