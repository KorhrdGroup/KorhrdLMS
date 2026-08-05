import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getMyCertificateApplications } from '@/features/certificate-applications/services/certificate-application.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

export const metadata: Metadata = { title: '자격증 발급 내역 — 한평생 직업훈련' };

/** 발급 신청 내역 — 마크업은 korhrd 디자인, 데이터는 기존 발급신청 서비스. */
export default async function Page() {
  const member = await getMockableStudentMember();
  if (!member) {
    redirect('/login?redirect=/certificate/status');
  }

  const items = await getMyCertificateApplications(member.id);

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/mylecture">나의 강의실</Link></li>
          <li aria-current="page">발급 내역</li>
        </ol>
      </nav>

      <div className="page-head"><h1>자격증 발급 내역</h1></div>

      {items.length === 0 ? (
        <div className="guide-box">
          <strong>발급 신청 내역이 없습니다</strong>
          <ul><li><Link href="/certificate">자격증 발급 신청</Link>에서 신청하실 수 있습니다.</li></ul>
        </div>
      ) : (
        items.map((item) => (
          <article className="my-card" key={item.id}>
            <div>
              <div className="my-card__head">
                <h2>{item.certificateName}</h2>
                <span className="badge badge--done">{item.deliveryStatusLabel}</span>
              </div>
              <p className="my-card__date">신청일 {item.appliedAt.slice(0, 10)}</p>
              <p className="my-card__status my-card__status--info">
                결제 {item.paymentStatusLabel} · 배송지 {item.fullAddress}
                {item.issuedAt ? ` · 발급일 ${item.issuedAt.slice(0, 10)}` : ''}
              </p>
            </div>
          </article>
        ))
      )}

      <p className="rv-cta">
        <Link className="btn btn--primary" href="/certificate">추가 발급 신청</Link>
      </p>
    </div>
  );
}
