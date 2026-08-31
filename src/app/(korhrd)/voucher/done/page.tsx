import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '평생교육이용권 결제 결과 — 한평생 직업훈련',
  robots: { index: false },
};

/** 나이스페이 결제 결과 안내 — 화면 정중앙에 체크·문구·버튼만 둡니다. */
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
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24,
      }}
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/voucher-complete-check.png"
          alt=""
          aria-hidden="true"
          style={{ display: 'block', width: 84, height: 84, objectFit: 'contain', marginBottom: 16 }}
        />
      ) : (
        <p style={{ fontSize: 44, marginBottom: 8 }}>❌</p>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        {ok ? '결제가 완료되었습니다' : '결제가 완료되지 않았습니다'}
      </h1>
      <p style={{ fontSize: 14, color: '#4E5968', marginBottom: 24 }}>
        {ok
          ? `${amt.toLocaleString()}원 결제가 정상 처리되었습니다.`
          : message || '결제가 취소되었거나 실패했습니다. 다시 시도해주세요.'}
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {ok ? (
          <Link className="btn btn--primary" href="/">홈</Link>
        ) : (
          <Link className="btn btn--primary" href="/support">다시 결제하기</Link>
        )}
        <Link className="btn btn--ghost" href="/support">고객센터</Link>
      </div>
    </div>
  );
}
