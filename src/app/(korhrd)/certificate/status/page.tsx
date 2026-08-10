import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getMyCertificateApplications } from '@/features/certificate-applications/services/certificate-application.service';
import type { MyCertificateApplicationItem } from '@/features/certificate-applications/types/certificate-application.types';
import { getMockableStudentMember } from '@/lib/mock-auth-server';
import PayButton from '@/features/payments/payapp/PayButton';

export const metadata: Metadata = { title: '발급 신청 현황 — 한평생 직업훈련' };

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/**
 * 발급 진행 4단계. 전달본(certificate-status.html)의 고정 4단계를 우리 상태값에 맞춥니다.
 *
 *   1 신청 접수  — 접수되면 무조건 완료
 *   2 입금 확인  — payment_status 가 결제완료/선납완료면 완료
 *   3 협회 전달  — delivery_status 가 준비중 이상이면 완료
 *   4 배송       — delivery_status 가 배송완료면 완료, 발송완료면 진행중
 */
const STEPS = ['신청 접수', '입금 확인', '협회 전달', '배송'] as const;

type StepState = 'done' | 'current' | 'todo';

function stepStates(item: MyCertificateApplicationItem): StepState[] {
  const paid = item.paymentStatus === 'paid' || item.paymentStatus === 'prepaid';
  const handedOver = ['preparing', 'shipped', 'delivered'].includes(item.deliveryStatus);
  const shipped = item.deliveryStatus === 'shipped';
  const delivered = item.deliveryStatus === 'delivered';

  const done = [
    true,
    paid,
    handedOver,
    delivered,
  ];

  // 완료되지 않은 첫 단계가 '진행중'입니다.
  const firstTodo = done.findIndex((value) => !value);
  return done.map((value, index) => {
    if (value) return 'done';
    if (index === firstTodo) return shipped && index === 3 ? 'current' : 'current';
    return 'todo';
  });
}

/** 카드 우측 배지 — 원본의 배송중/입금 대기/발급 완료 표기를 따릅니다. */
function badgeOf(item: MyCertificateApplicationItem) {
  if (item.deliveryStatus === 'canceled') return { tone: 'expired', label: '취소' };
  if (item.deliveryStatus === 'delivered') return { tone: 'done', label: '발급 완료' };
  if (item.deliveryStatus === 'shipped') return { tone: 'learning', label: '배송중' };
  if (item.paymentStatus === 'paid' || item.paymentStatus === 'prepaid') {
    return { tone: 'learning', label: '발급 준비중' };
  }
  return { tone: 'expired', label: '입금 대기' };
}

/** 아직 받아야 할 돈이 남은 신청인지 — 결제 버튼을 띄울지 정합니다. */
function needsPayment(item: MyCertificateApplicationItem) {
  if (item.deliveryStatus === 'canceled') return false;
  if (item.paymentStatus === 'paid' || item.paymentStatus === 'prepaid') return false;
  return item.amount > 0;
}

/** 카드 하단 안내 문구 — 상태별로 지금 무엇을 하면 되는지 알려줍니다. */
function messageOf(item: MyCertificateApplicationItem) {
  if (item.deliveryStatus === 'canceled') {
    return { tone: 'info', text: '취소된 신청입니다. 다시 신청하실 수 있습니다.' };
  }
  if (item.deliveryStatus === 'delivered') {
    return {
      tone: 'done',
      text: item.issuedAt
        ? `${item.issuedAt.slice(0, 10)} 배송이 완료되었습니다.`
        : '배송이 완료되었습니다.',
    };
  }
  if (item.paymentStatus === 'paid' || item.paymentStatus === 'prepaid') {
    return { tone: 'info', text: '결제가 확인되었습니다. 매주 화요일 협회로 명단이 전달됩니다.' };
  }
  return {
    tone: 'info',
    text: '입금이 확인되지 않았습니다. 신한 140-015-773620 (주)한평생그룹으로 본인 명의 입금해 주세요.',
  };
}

/**
 * 발급 신청 현황.
 * 프로토타입 원본: korhrd-site/certificate-status.html — 구조·클래스를 그대로 씁니다.
 * (원본은 카드 3장이 고정값이었고, 여기서는 본인 신청 내역을 최신순으로 그립니다)
 */
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
          <li><Link href="/certificate">자격증 발급신청</Link></li>
          <li aria-current="page">발급 신청 현황</li>
        </ol>
      </nav>

      <div className="page-head"><h1>발급 신청 현황</h1></div>

      <div className="layout-side mt-5">
        <aside>
          <nav className="filter-group" aria-label="발급 메뉴">
            <Link className="side-nav__item" href="/certificate">발급 신청</Link>
            <Link className="side-nav__item" href="/certificate/status" aria-current="page">
              발급 신청 현황
            </Link>
          </nav>
        </aside>

        <div>
          <section>
            {items.length === 0 ? (
              <div className="guide-box">
                <strong>발급 신청 내역이 없습니다</strong>
                <ul>
                  <li><Link href="/certificate">자격증 발급 신청</Link>에서 신청하실 수 있습니다.</li>
                </ul>
              </div>
            ) : (
              items.map((item) => {
                const badge = badgeOf(item);
                const message = messageOf(item);
                const states = stepStates(item);
                // 미니 바가 가리키는 단계 — 진행중인 칸, 다 끝났으면 마지막 칸입니다
                const allDone = states.every((state) => state === 'done');
                const stepNo = allDone ? STEPS.length : states.indexOf('current') + 1;

                return (
                  <article className="my-card my-card--stack" key={item.id}>
                    <div className="my-card__head">
                      <h2>{item.certificateName}</h2>
                      <span className={`badge badge--${badge.tone}`}>{badge.label}</span>
                    </div>

                    <p className="my-card__date">
                      신청일 <time dateTime={item.appliedAt}>{item.appliedAt}</time>
                      {' · '}{won(item.amount)}
                      {item.paymentMethodLabel ? ` · ${item.paymentMethodLabel}` : ''}
                    </p>

                    <div className="issue-steps">
                      <ol className="steps-indicator steps-indicator--left">
                        {/* 원본은 단계 사이에 .bar 를 하나씩 끼워 넣습니다 */}
                        {STEPS.flatMap((label, index) => [
                          ...(index > 0
                            ? [<li className="bar" aria-hidden="true" key={`bar-${label}`} />]
                            : []),
                          <li
                            key={label}
                            className={states[index] === 'todo' ? undefined : `is-${states[index]}`}
                          >
                            <span className="n">{index + 1}</span>
                            {label}
                          </li>,
                        ])}
                      </ol>

                      {/* 좁은 화면(≤560px)에서는 위 4단계 표시가 숨고 이 미니 바가 대신 나옵니다 */}
                      <div className={allDone ? 'issue-steps__mini is-done' : 'issue-steps__mini'}>
                        <p className="issue-steps__now">
                          <b>{stepNo}단계</b>
                          <span className="txt">{STEPS[stepNo - 1]}</span>
                          <span className="of">전체 {STEPS.length}단계</span>
                        </p>
                        <span className="issue-steps__track" aria-hidden="true">
                          <i style={{ width: `${(stepNo / STEPS.length) * 100}%` }} />
                        </span>
                      </div>
                    </div>

                    <p className={`my-card__status my-card__status--${message.tone}`}>{message.text}</p>

                    <p className="my-card__date">배송지 {item.fullAddress}</p>

                    {/* 결제가 남아 있으면 여기서 바로 결제할 수 있어야 합니다.
                        (신청 직후 완료 화면을 벗어나면 결제할 길이 없었습니다) */}
                    {needsPayment(item) ? (
                      <p className="rv-cta" style={{ marginTop: 12 }}>
                        <PayButton applicationId={item.id} />
                      </p>
                    ) : null}
                  </article>
                );
              })
            )}

            <div className="guide-box">
              <strong>발급 진행 안내</strong>
              <ul>
                <li>매주 화요일 협회로 명단이 전달되며, 배송은 전달일로부터 1~2일 소요됩니다</li>
                <li>무통장 입금은 본인 명의로 입금하셔야 자동 확인됩니다</li>
                <li>신청일 다음 날부터 최대 7일(휴일 제외) 이내 도착합니다</li>
                <li>배송지 변경은 협회 전달 전까지만 고객센터로 요청하실 수 있습니다</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
