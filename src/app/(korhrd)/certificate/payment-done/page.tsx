import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '결제 완료 — 한평생 직업훈련',
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * PayApp 결제 팝업 콜백 페이지.
 *
 * 결제 창은 팝업이라, 이 화면은 부모 창(opener)을 옮겨 놓고 자기는 닫습니다.
 * 옮겨 갈 곳은 그 신청 건의 완료 화면입니다 — 결제까지 끝난 모습('결제가
 * 완료됐어요')으로 그려집니다 (2026-08-12, 디자인 요청).
 *
 * 결제 결과 자체는 이 화면이 아니라 서버 통보(/api/payapp/feedback)로 확정됩니다.
 * 여기서는 어디로 보낼지만 정합니다. id 가 없으면(옛 결제창·직접 접근) 예전처럼
 * 발급 신청 현황으로 보냅니다.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.id;
  const id = (Array.isArray(raw) ? raw[0] : raw) ?? '';
  const target = id
    ? `/certificate/complete?id=${encodeURIComponent(id)}`
    : '/certificate/status';

  return (
    <div className="container">
      <div className="auth-wrap" style={{ paddingTop: 80, textAlign: 'center' }}>
        <p className="complete__mark" aria-hidden="true">✓</p>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>결제가 완료되었습니다</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          잠시 후 자동으로 이동합니다.
        </p>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var target = ${JSON.stringify(target)};
                if (window.opener && !window.opener.closed) {
                  window.opener.location.href = target;
                  window.close();
                } else {
                  window.location.href = target;
                }
              })();
            `,
          }}
        />
        <noscript>
          <a className="btn btn--primary" href={target}>결제 결과 보기</a>
        </noscript>
      </div>
    </div>
  );
}
