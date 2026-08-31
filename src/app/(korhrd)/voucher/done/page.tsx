import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '평생교육이용권 결제 결과 — 한평생 직업훈련',
  robots: { index: false },
};

/** 나이스페이 결제 결과 안내 — /api/nicepay/return 이 승인까지 마친 뒤 옵니다. */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pick = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '');
  const ok = pick('result') === 'ok';
  const amt = Number(pick('amt')) || 0;
  const message = pick('message');

  return (
    <div className="container">
      <div className="page-head"><h1>평생교육이용권 결제</h1></div>

      <div className="card" style={{ maxWidth: 520, padding: 32, textAlign: 'center' }}>
        {ok ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/voucher-complete-check.png"
            alt=""
            aria-hidden="true"
            style={{ display: 'block', width: 72, height: 72, objectFit: 'contain', margin: '0 auto 12px' }}
          />
        ) : (
          <p style={{ fontSize: 40, marginBottom: 8 }}>❌</p>
        )}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          {ok ? '결제가 완료되었습니다' : '결제가 완료되지 않았습니다'}
        </h2>
        <p style={{ fontSize: 14, color: '#4E5968', marginBottom: 20 }}>
          {ok
            ? `${amt.toLocaleString()}원 결제가 정상 처리되었습니다. 확인 후 순차적으로 처리해드립니다.`
            : message || '결제가 취소되었거나 실패했습니다. 다시 시도해주세요.'}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {ok ? (
            <Link className="btn btn--primary" href="/mylecture">나의 강의실로</Link>
          ) : (
            <Link className="btn btn--primary" href="/voucher">다시 결제하기</Link>
          )}
          <Link className="btn btn--ghost" href="/support">고객센터</Link>
        </div>
      </div>
    </div>
  );
}
