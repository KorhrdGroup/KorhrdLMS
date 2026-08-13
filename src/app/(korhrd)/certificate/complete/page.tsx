import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getCertificateApplicationReceipt } from '@/features/certificate-applications/services/certificate-application-receipt.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import CopyAccountButton from './CopyAccountButton';
import PayButton from '@/features/payments/payapp/PayButton';

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
          {/* 결제까지 끝난 화면은 카드 결제(PayApp)를 마치고 돌아오는 자리이기도
              합니다 — 그때는 '신청'이 아니라 '결제'가 방금 끝난 일입니다
              (2026-08-12, 디자인 요청). */}
          <h1>{receipt.needsDeposit ? '자격증 발급 신청이 완료됐어요' : '결제가 완료됐어요'}</h1>
          <p className="complete__sub">
            {receipt.certificateName} · 신청일 {receipt.appliedAt}
            <br />
            {!receipt.needsDeposit
              ? '결제가 확인되어 발급이 진행됩니다. 매주 화요일 협회로 명단이 전달됩니다.'
              : receipt.isCardPayment
                ? '결제 확인 후 발급이 진행되며, 매주 화요일 협회로 명단이 전달됩니다.'
                : '입금 확인 후 발급이 진행되며, 매주 화요일 협회로 명단이 전달됩니다.'}
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
            {/* 결제 안내는 이 화면에서 가장 먼저 읽혀야 하는 줄이라 다른 줄과 다르게
                그립니다 — 연블루 바탕에 가운데 정렬(overrides.css). 다른 줄과 달리
                이름표 뒤 대시는 두지 않습니다: 금액과 그 아랫줄이 이미 나뉘어
                있어 굳이 끊어 줄 필요가 없습니다 (2026-08-12, 디자인 요청). */}
            {receipt.needsDeposit && receipt.isCardPayment ? (
              /* 카드로 고른 사람에게 계좌를 보여 주면 무통장으로 오해합니다 */
              <li className="next-list__pay">
                <span>
                  <b>결제하실 금액</b> {won(receipt.payableAmount)} (카드 결제)<br />
                  아래 <b>결제하기</b>를 눌러 결제를 진행해 주세요
                </span>
              </li>
            ) : receipt.needsDeposit ? (
              <li className="next-list__pay">
                <span>
                  <b>입금하실 금액</b> {won(receipt.payableAmount)} (본인 명의 입금)<br />
                  신한은행 140-015-773620 (주)한평생그룹
                </span>
              </li>
            ) : (
              <li>
                <span><b>결제</b> — {receipt.paymentStatusLabel}</span>
              </li>
            )}
          </ul>

          {/* 결제가 남았으면 흰색은 발급 신청 현황(진행 단계를 보는 곳), 남색은 지금
              해야 할 일입니다 — 카드는 결제, 무통장은 계좌 복사.
              결제까지 끝났으면 할 일이 없어 갈 곳 하나만 남깁니다
              (2026-08-12, 디자인 요청). */}
          {receipt.needsDeposit ? (
            <div className="complete__cta">
              <Link className="btn btn--ghost btn--lg" href="/certificate/status">
                발급 신청 현황 보기
              </Link>
              {receipt.isCardPayment ? (
                <PayButton
                  applicationId={receipt.id}
                  className="btn btn--primary btn--lg"
                  label="결제하기"
                />
              ) : (
                /* 예금주까지 복사하면 뱅킹앱 붙여넣기에 걸리적거려 은행+계좌번호만 복사합니다 */
                <CopyAccountButton
                  text="신한은행 140-015-773620"
                  className="btn btn--primary btn--lg"
                  label="입금계좌 복사"
                />
              )}
            </div>
          ) : (
            <div className="complete__cta">
              <Link className="btn btn--primary btn--lg" href="/certificate/status">
                발급 신청 현황 보기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
