import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getCertificateApplicationReceipt } from '@/features/certificate-applications/services/certificate-application-receipt.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import CopyAccountButton from './CopyAccountButton';

export const metadata: Metadata = {
  title: '자격증 발급 신청 완료 — 한평생 직업훈련',
  robots: { index: false },
};

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/**
 * 자격증 발급 신청 완료.
 * 프로토타입 원본: korhrd-site/certificate-complete.html
 *
 * 원본은 안내 문구가 전부 고정값이었습니다. 방금 접수한 신청 건을 조회해
 * 과정명·입금하실 금액·배송지를 실제 값으로 보여줍니다. 선납결제로 전액
 * 충당된 경우에는 입금 계좌 안내를 띄우지 않습니다.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect('/login?redirect=/certificate/status');
  }

  const receipt = await getCertificateApplicationReceipt(member.id, first(params.id));

  if (!receipt) {
    redirect('/certificate/status');
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="complete" style={{ paddingTop: 40 }}>
          <p className="complete__mark" aria-hidden="true">✓</p>
          <h1>자격증 발급 신청이 완료됐어요</h1>
          <p className="complete__sub">
            {receipt.certificateName} · 신청일 {receipt.appliedAt}
            <br />
            {receipt.needsDeposit
              ? '입금 확인 후 발급이 진행되며, 매주 화요일 협회로 명단이 전달됩니다.'
              : '결제가 확인되어 발급이 진행됩니다. 매주 화요일 협회로 명단이 전달됩니다.'}
          </p>

          <ul className="next-list">
            <li>
              <span><b>배송지</b> — {receipt.fullAddress || '등록된 주소가 없습니다'}</span>
            </li>
            <li>
              <span><b>배송 예정</b> — 신청일 다음 날부터 영업일 기준 최대 14일(휴일 제외) 이내 도착</span>
            </li>
            <li>
              <span><b>발급 형태</b> — 상장형 · 카드형 자격증 동시 발급</span>
            </li>
            {receipt.needsDeposit ? (
              /* 입금 안내는 이 화면에서 가장 먼저 읽혀야 하는 줄이라 다른 줄과
                 다르게 그립니다 — 연블루 바탕에 가운데 정렬(overrides.css).
                 다른 줄과 달리 이름표 뒤 대시는 두지 않습니다. 금액과 계좌가
                 줄로 나뉘어 있어 굳이 끊어 줄 필요가 없습니다
                 (2026-08-12, 디자인 요청). */
              <li className="next-list__pay">
                <span>
                  <b>입금하실 금액</b> {won(receipt.payableAmount)}<br />
                  신한은행 140-015-773620 (주)한평생그룹 (본인 명의 입금)
                  <CopyAccountButton text="신한은행 140-015-773620 (주)한평생그룹" />
                </span>
              </li>
            ) : (
              <li>
                  <span><b>결제</b> — {receipt.paymentStatusLabel} (추가 입금이 필요하지 않습니다)</span>
              </li>
            )}
          </ul>

          <div style={{ display: 'grid', gap: 8 }}>
            {/* 무통장입금 안내로 운영합니다 — 발급비 결제하기(PayApp) 버튼은 뺐습니다 (2026-08-12) */}
            <Link
              className="btn btn--block btn--primary btn--lg"
              href="/mylecture"
            >
              나의 강의실로 이동
            </Link>
            <Link className="btn btn--ghost btn--block" href="/certificate/status">
              발급 신청 현황 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
