import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '결제 완료 — 한평생 직업훈련',
  robots: { index: false },
};

/**
 * PayApp 결제 팝업 콜백 페이지.
 * 결제 완료 후 PayApp이 이 페이지로 리다이렉트합니다.
 * 부모 창(opener)을 발급 신청 현황으로 이동시키고 팝업을 닫습니다.
 * opener가 없으면(직접 접근) 직접 이동합니다.
 */
export default function Page() {
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
                var target = '/certificate/status';
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
          <a className="btn btn--primary" href="/certificate/status">발급 신청 현황으로 이동</a>
        </noscript>
      </div>
    </div>
  );
}
